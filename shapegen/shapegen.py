import shapefile as shp
import csv

'''
Parses csv in the form
POINT, MAP_NAME, LAT, LNG, [METADATA] and
POLYGON, MAP_NAME, PT1 ... PTN

Outputs a shapefile
'''
def csvToShapefile(csv_file_name, shp_file_name):

    ''' 
    Generate the shape file from the polygon data
    '''
    def writePoly(shp_w, csv_reader, header_width):
        pass

    ''' 
    Generate the shape file from the point data
    ''' 
    def writePoint(shp_w, csv_reader, hasMeta):
        
        shp_w.field('MAP')
        shp_w.field('LAT', 'F', 10, 8)
        shp_w.field('LNG', 'F', 10, 8)
        if hasMeta:
            shp_w.field('METADATA')

        for row in csv_reader:
            shp_w.point(float(row[3]), float(row[2]))
            if hasMeta:
                shp_w.record(str(row[1]), float(row[3]), float(row[2]), str(row[4]))
            else: 
                shp_w.record(str(row[1]), float(row[3]), float(row[2]))

            print row

        print header, hasMeta

    with open(csv_file_name, 'rb') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        header = next(csv_reader, None)
        shp_type = header[0]; # POINT POLY?
        header_width = len(header) - 2
        shp_w = None

        # Determine writer type
        if shp_type == "POLYGON":
            assert(header_width > 2)
            shp_w = shp.Writer(shp.POLYGON)
            return writePoly(shp_w, csv_reader, header_width)

        if shp_type == "POINT":
            assert( (header_width == 2) or (header_width == 3) )
            shp_w = shp.Writer(shp.POINT)
            writePoint(shp_w, csv_reader, header_width==3)

        if not shp_w:
            return 1

        shp_w.save(shp_file_name)
        return 0
        
def arrayToShapefile(data_array, shp_file_name):
    ''' 
    Generate the shape file from the polygon data
    '''
    def writePoly(shp_w, data_array, header_width):
        pass

    ''' 
    Generate the shape file from the point data
    ''' 
    def writePoint(shp_w, data_array, hasMeta):
        
        shp_w.field('MAP')
        shp_w.field('LAT', 'F', 10, 8)
        shp_w.field('LNG', 'F', 10, 8)
        if hasMeta:
            shp_w.field('METADATA')

        for row in data_array:
            shp_w.point(float(row[3]), float(row[2]))
            if hasMeta:
                shp_w.record(str(row[1]), float(row[3]), float(row[2]), str(row[4]))
            else: 
                shp_w.record(str(row[1]), float(row[3]), float(row[2]))

            print row

        print header, hasMeta

    header = data_array[0]
    shp_type = header[0]; # POINT POLY?
    header_width = len(header) - 2
    shp_w = None
    data_array.remove(header);

    # Determine writer type
    if shp_type == "POLYGON":
        assert(header_width> 2)
        shp_w = shp.Writer(shp.POLYGON)
        return writePoly(shp_w, data_array, header_width)

    if shp_type == "POINT":
        assert( (header_width == 2) or (header_width == 3) )
        shp_w = shp.Writer(shp.POINT)
        writePoint(shp_w, data_array, header_width==3)

    if not shp_w:
        return 1

    shp_w.save(shp_file_name)
    return 0

'''
Read a shapefile matching output form above and return a csv
'''
def shapefileToArray(shp_file_name=None, shpf=None, dbff=None, shxf=None):
    if shp_file_name:
        sf = shp.Reader(shp_file_name)
    else:
        sf = shp.Reader(shp=shpf, dbf=dbff, shx=shxf)
   
    def isPointWithMeta(rec):
        return len(rec) == 4 and type(rec[3]) is str

    def isPoint(rec):
        return len(rec) == 3 or isPointWithMeta(rec)

    def isPoly(rec):
        pass

    def buildPointHeader(rec):
        header = "POINT,MAP,LAT,LNG"
        hasMeta = False
        if isPointWithMeta(rec):
            header += ",METADATA"
            hasMeta = True

        return header, hasMeta
    
    def buildPolyHeader(rec):
        header = "POLY,MAP,......"
        return header

    
    def writePolyArray(sf_reader, header, hasMeta):
        pass

    def writePointArray(sf_reader, header, hasMeta):
        data_array = []
        for rec in sf_reader:

            if hasMeta:
                data_array.append(("POINT",rec[0], float(rec[2]),float(rec[1]), rec[3]))
            else:
                data_array.append(("POINT",rec[0], float(rec[2]),float(rec[1])))

            print rec 

        return data_array 


    header = None
    rec = next(sf.iterRecords())
    print rec

    #for shapes in sf.iterShapes():
    #    print shapes
    #    for name in dir(shapes):
    #        if not name.startswith('__'):
    #            #print name 
    #            pass

    #    print shapes.points
    #    print shapes.shapeType


    #for rec in sf.iterRecords():
    #    print rec
    #return;
    data_array = []
    if isPoint(rec):
        header,hasMeta = buildPointHeader(rec) 
        data_array = writePointArray(sf.iterRecords(), header, hasMeta);
        
    elif isPoly(rec):
        #header,hasMeta = buildPolyHeader(rec) 
        #writePolyArray(sf.iterRecords(), header, hasMeta);
        pass
    else:
        # No idea what shp file is (not my format)
        return 1

    print header 
    print data_array 
    return data_array


if __name__ == '__main__':
    shapefileToArray("counts")
    #csvToShapefile('test.csv', 'test')
    #shapefileToArray('test')

    #data_array = [('POINT', 'MAP', 'LAT', 'LNG'), ('POINT', 'Myanmar', 48.1, 0.25), ('POINT', 'Myanmar', 49.2, 1.1), ('POINT', 'Myanmar', 47.5, 0.75)]
    #arrayToShapefile(data_array, 'test')
    #shapefileToArray('test')


