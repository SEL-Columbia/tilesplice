#!tilesplice/bin/python
from flask import Flask
from flask import request
from math import floor
from clippers import range_clipper as rc
from shapegen import shapegen as sp
import os

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
    
    out_tiff = rc.range_clip(top_x, top_y, bot_x, bot_y, geo_path, geo_tiff)

    if os.path.exists(out_tiff):
        return out_tiff

    return "Could not clip tif" 

@app.route('/upload.csv')
def upload():
    return "Not implemented"

@app.route('/load.shp')
def load():
    return "Not implemented"

@app.route('/<path:path>')
def serve_anything(path):
    print path
    return app.send_static_file(path)

if __name__ == '__main__':
    app.run(debug=True)
