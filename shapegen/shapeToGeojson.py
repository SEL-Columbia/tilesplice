import shapefile
import json
# Code from geospatialpython.com
#http://geospatialpython.com/2013/07/shapefile-to-geojson.html 

def shapefileToGeojson(shp, shx=None, dbf=None):
    # read the shapefile
    reader = None
    reader = shapefile.Reader(shp=shp, shx=shx, dbf=dbf)
    fields = reader.fields[1:]
    field_names = [field[0] for field in fields]
    buf = []
    for sr in reader.shapeRecords():
        atr = dict(zip(field_names, sr.record))
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

    shx = open("test.shx");
    shp = open("test.shp");
    dbf = open("test.dbf");
    geojson = shapefileToGeojson(shp, shx, dbf);
    print geojson
