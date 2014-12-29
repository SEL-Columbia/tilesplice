#!tilesplice/bin/python
from flask import Flask
from flask import request
from math import floor
import clippers.range_clipper as rc
from shapegen.shapeToGeojson import *
from shapegen.geojsonToShape import *
import ast
import os
from datetime import date
import json
import uuid 
import logging
from logging.handlers import RotatingFileHandler as rfh

app = Flask(__name__, static_folder='')

root = "/var/www/tilesplice/"


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/clip.tif')
def clip():
    top_x = float(request.args.get('top_x'))
    top_y = float(request.args.get('top_y'))
    bot_x = float(request.args.get('bot_x'))
    bot_y = float(request.args.get('bot_y'))
    raster = request.args.get('image')
    geo_tiff = raster + '.tif'
    geo_path = os.path.join(root, raster, geo_tiff) #geotiff is stored in in dir named after itself
    
    out_tiff = root + "output/%s.out.%s.tif" %(raster, str(uuid.uuid4()))
    out_tiff = rc.range_clip(top_x, top_y, bot_x, bot_y, geo_path, out_tiff)

    if os.path.exists(out_tiff):
        return out_tiff

    return "Could not clip tif" 

@app.route('/download.geojson', methods=['POST'])
def download():
    features = request.get_json(force=True);
    raster = request.args.get('raster');
    shp_file = "output/%s.out.%s." %(raster, str(uuid.uuid4()))
    path = root + shp_file
    if geojsonToShape(features, path, raster) == 0:
        return shp_file
    else:
        return "Could not produce shapefile"

@app.route('/upload.shp', methods=['POST'])
def upload():

    # Guranteed to be valid (at least) one element lists
    shp = request.files.getlist("shp")[0]
    dbf = request.files.getlist("dbf")[0]

    # May or may not have been submitted
    shx = request.files.getlist("shx")
    prj = request.files.getlist("prj")
    shx = shx[0] if (shx and len(shx) == 1) else None
    prj = prj[0] if (prj and len(prj) == 1) else None

    geojson = shapefileToGeojson(shp, shx, dbf, prj);
    return geojson

@app.route('/<path:path>')
def serve_anything(path):
    print path
    return app.send_static_file(path)

if __name__ == '__main__':
    handler = rfh('tilesplice.log', maxBytes=10000, backupCount=3)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.run(host="0.0.0.0",port=8080)
