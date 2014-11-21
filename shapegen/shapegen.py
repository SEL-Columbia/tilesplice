import shapefile as shp
import csv

'''
Parses csv in the form
POINT, MAP_NAME, LAT, LNG, [METADATA] and
POLYGON, MAP_NAME, PT1 ... PTN

Outputs a shapefile
'''
def csvToShapefile(csv_file_name, shp_file_name, fromArray=False):

    ''' 
    Generate the shape file from the polygon data
    '''
    def writePoly(shp_w, csv_reader, csv_len):
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

    if fromArray:
        csv_reader = csv_file_name
        header = csv_reader[0]
        shp_type = header[0]; # POINT POLY?
        csv_len = len(header) - 2
        shp_w = None
        csv_reader.remove(header);

        # Determine writer type
        if shp_type == "POLYGON":
            assert(csv_len > 2)
            shp_w = shp.Writer(shp.POLYGON)
            return writePoly(shp_w, csv_reader, csv_len)

        if shp_type == "POINT":
            assert( (csv_len == 2) or (csv_len == 3) )
            shp_w = shp.Writer(shp.POINT)
            writePoint(shp_w, csv_reader, csv_len==3)

        if not shp_w:
            return 1

        shp_w.save(shp_file_name)
        return 0

    with open(csv_file_name, 'rb') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        header = next(csv_reader, None)
        shp_type = header[0]; # POINT POLY?
        csv_len = len(header) - 2
        shp_w = None

        # Determine writer type
        if shp_type == "POLYGON":
            assert(csv_len > 2)
            shp_w = shp.Writer(shp.POLYGON)
            return writePoly(shp_w, csv_reader, csv_len)

        if shp_type == "POINT":
            assert( (csv_len == 2) or (csv_len == 3) )
            shp_w = shp.Writer(shp.POINT)
            writePoint(shp_w, csv_reader, csv_len==3)

        if not shp_w:
            return 1

        shp_w.save(shp_file_name)
        return 0
        
'''
Read a shapefile matching output form above and return a csv
'''
def shapeFileToCsv(shp_file_name, csv_file_name):
    sf = shp.Reader(shp_file_name)
   
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
        header = "POINT,MAP,......"
        return header

    
    def writePolyCsv(sf_reader, header, hasMeta):
        pass

    def writePointCsv(sf_reader, header, hasMeta):
        csv_data = []
        for rec in sf_reader:

            if hasMeta:
                csv_data.append(("POINT",rec[0], float(rec[2]),float(rec[1]), rec[3]))
            else:
                csv_data.append(("POINT",rec[0], float(rec[2]),float(rec[1])))

            print rec 

        return csv_data


    header = None
    rec = next(sf.iterRecords())
    print rec

    if isPoint(rec):
        header,hasMeta = buildPointHeader(rec) 
        csv_data = writePointCsv(sf.iterRecords(), header, hasMeta);
        
    elif isPoly(rec):
        #header,hasMeta = buildPolyHeader(rec) 
        #writePolyCsv(sf.iterRecords(), header, hasMeta);
        pass
    else:
        # No idea what shp file is (not my format)
        return 1

    print header, hasMeta
    print csv_data
    return csv_data 


if __name__ == '__main__':
    csvToShapefile('test.csv', 'test')
    shapeFileToCsv('test', None)

    csv = [('POINT', 'MAP', 'LAT', 'LNG'), ('POINT', 'Myanmar', 48.1, 0.25), ('POINT', 'Myanmar', 49.2, 1.1), ('POINT', 'Myanmar', 47.5, 0.75)]
    csvToShapefile(csv, 'test', True)
    shapeFileToCsv('test', None)

