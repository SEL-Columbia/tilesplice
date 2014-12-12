import shapefile
import json
import osr
# Code for shpfile records -> feature collection from geospatialpython.com
#http://geospatialpython.com/2013/07/shapefile-to-geojson.html 

def shapefileToGeojson(shp, shx=None, dbf=None, prj=None, map_name="global"):
    # read the shapefile
    reader = None
    reader = shapefile.Reader(shp=shp, shx=shx, dbf=dbf)
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    buf = []
    projection = ""

    # read projection
    if prj:
        prj_text = prj.read()
        sr = osr.SpatialReference()
        if not sr.ImportFromWkt(prj_text):
            # Conversion done to confirm projection text is valid
            projection = sr.ExportToProj4()

    # write feature collection
    for sr in reader.shapeRecords():
        atr = dict(zip(field_names, sr.record))
        # Add my fields 
        if not atr.get('map'):
            atr['map'] = map_name
        if not atr.get('projection'):
            atr['projection'] = projection

        geom = sr.shape.__geo_interface__
        buf.append(dict(type="Feature", \
                geometry=geom, properties=atr)) 

    # write the GeoJSON file
    return json.dumps({"type": "FeatureCollection", "features": buf}, indent=2)


if __name__ == '__main__':
    shx = open("counts.shx");
    shp = open("counts.shp");
    dbf = open("counts.dbf");
    #geojson = shapefileToGeojson(shp, shx, dbf);
    geojson = shapefileToGeojson(shp, dbf=dbf);
    print geojson

    shx = open("counts.shx");
    shp = open("counts.shp");
    dbf = open("counts.dbf");
    prj = open("counts.prj");
    #geojson = shapefileToGeojson(shp, shx, dbf);
    geojson = shapefileToGeojson(shp, shx, dbf, prj);
    print geojson
