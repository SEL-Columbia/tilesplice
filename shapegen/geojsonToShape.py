import shapefile
import json

def geojsonToShape(geojson, shpfile, map_name="global"):

    def writePoly(shp_w, features, hasMeta):
        pass

    ''' 
    Generate the shape file from the point data
    ''' 
    def writePoint(shp_w, features, map_name):
        
        shp_w.field('map')

        
        #meta data
        #first_feature = features[0];
        #for name in first_feature.keys(): 
        #    shp_w.field(name)

        for feature in features:
            coords = feature['geometry']['coordinates']
            shp_w.point(float(coords[0]), float(coords[1]))
            shp_w.record(map_name)
            # this assumes ordering for keys will not change btwn calls
            #for name in feature.keys(): 
            #    shp_w.record(map_name, 
    

    
    shp_w = None
    features = geojson['features']
    if len(features) < 1:
        return;

    first_feature = features[0]
    
    # Determine what the geometry is to record a shapefile
    shp_type = first_feature['geometry']['type']

    # switch on shp_type
    if shp_type == "Point":
        
        shp_w = shapefile.Writer(shapefile.POINT)
        writePoint(shp_w, features, map_name)

    elif shp_type == "LineString":
        pass
    elif shp_type == "Polygon":
        pass
    elif shp_type == "GeometryCollection":
        pass
    elif shp_type == "MultiPoint":
        pass
    elif shp_type == "MultiLineString":
        pass
    elif shp_type == "MultiPolygon":
        pass
    elif shp_type == "Positions":
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