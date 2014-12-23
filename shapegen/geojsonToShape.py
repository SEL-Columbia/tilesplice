import shapefile
import json

def geojsonToShape(geojson, shpfile, map_name="global"):

    def writePoly(shp_w, features):
        shp_w.field('map'); #TODO remove but apparently you need a field of pyshp breaks
        for feature in features:
            coords = feature['geometry']['coordinates'][0] #TODO loop through all polys
            coordsf = [[float(c[0]), float(c[1])] for c in coords];
            shp_w.poly(parts=[coordsf])
            shp_w.record(map_name);

    ''' 
    Generate the shape file from the point data
    ''' 
    def writePoint(shp_w, features, props):
        
        [shp_w.field(prop) for prop in props]
        for feature in features:
            coords = feature['geometry']['coordinates']
            shp_w.point(float(coords[0]), float(coords[1]))
            values = [str(feature['properties'][prop]) 
                        if prop in feature['properties'].keys() 
                        else None 
                        for prop in props
                      ]

            shp_w.record(*values)
    
    shp_w = None
    features = geojson['features']
    if len(features) < 1:
        return;

    first_feature = features[0]
    props = set()
    for feature in features:
        for key in feature['properties'].keys():
            props.add(str(key))
    
    
    # Determine what the geometry is to record a shapefile
    shp_type = first_feature['geometry']['type']

    # switch on shp_type
    if shp_type == "Point":
        
        shp_w = shapefile.Writer(shapefile.POINT)
        writePoint(shp_w, features, list(props))

    elif shp_type == "LineString":
        pass
    elif shp_type == "Polygon":

        shp_w = shapefile.Writer(shapefile.POLYGON)
        writePoly(shp_w, features)

    elif shp_type == "Polyline":
        pass
    elif shp_type == "MultiPoint":
        pass
    elif shp_type == "MultiLineString":
        pass
    elif shp_type == "MultiPolygon":
        pass
    else:
        print "Unknown geometry"
        return 1;

    shp_w.save(shpfile)
    return 0
        

if __name__ == '__main__':

    from shapeToGeojson import *

    shx = open("counts.shx")
    shp = open("counts.shp")
    dbf = open("counts.dbf")
    #geojson = shapefileToGeojson(shp, shx, dbf);
    geojson = shapefileToGeojson(shp, dbf=dbf)
    geojson = json.loads(geojson)

    geojsonToShape(geojson, "newcounts")

    shx = open("newcounts.shx")
    shp = open("newcounts.shp")
    dbf = open("newcounts.dbf")
    
    geojson = shapefileToGeojson(shp, dbf=dbf)
    print geojson
