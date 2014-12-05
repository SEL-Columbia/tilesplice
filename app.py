#!tilesplice/bin/python
from flask import Flask
from flask import request
from math import floor
from clippers import range_clipper as rc
from shapegen import shapegen as sp
import ast
import os
from datetime import date
import json

app = Flask(__name__, static_folder='')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/clip.tif')
def clip():
    top_x = float(request.args.get('top_x'))
    top_y = float(request.args.get('top_y'))
    bot_x = float(request.args.get('bot_x'))
    bot_y = float(request.args.get('bot_y'))
    geo_tiff = request.args.get('image') + '.tif'
    geo_path = os.path.join(geo_tiff.split(".")[0], geo_tiff)
    
    out_tiff = "output/%s.out.%d.%d.tif" %(geo_tiff.split(".")[0], top_x, top_y)
    out_tiff = rc.range_clip(top_x, top_y, bot_x, bot_y, geo_path, out_tiff)

    if os.path.exists(out_tiff):
        return out_tiff

    return "Could not clip tif" 

@app.route('/download.csv', methods=['POST'])
def download():
    csv = request.get_json(force=True)['csv']
    shp_type,raster,lat,lng = csv[1] #line 0 is header
    shp_file = "output/%s.%.5f.%.5f.%s." %(raster, float(lat), float(lng), shp_type)
    if sp.arrayToShapefile(csv, shp_file) == 0:
        return shp_file
    else:
        return "Could not produce shapefile"

@app.route('/upload.shp', methods=['POST'])
def upload():
    shx = request.files.getlist("shx")[0]
    shp = request.files.getlist("shp")[0]
    dbf = request.files.getlist("dbf")[0]

    print request.files

    data_array = sp.shapefileToArray(shpf=shp, dbff=dbf, shxf=shx);
    return json.dumps({'csv': data_array})

@app.route('/<path:path>')
def serve_anything(path):
    print path
    return app.send_static_file(path)

if __name__ == '__main__':
    app.run(debug=True)
