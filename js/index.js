var L = require('leaflet');
require('leaflet-draw');

var Proj4js = require('proj4');

var locale = require('./tilesets.js').locale;
var localeOptions = require('./tilesets.js').localeOptions;

var editor = require('./editor.js');

var map = editor.map,
    drawGroup = editor.drawGroup,
    dom = editor.dom,
    icon_alt = editor.icon_alt;

var geojsondiv = dom.log,
    input = dom.input;

var basechange = require('./baselayerchange.js');
var drawcreated = require('./drawcreated.js');
var loadshapefile = require('./uploadshapefile.js');

/******************************************************************************/

/* DOWNLOAD */
// The only event that matters, drawing a box, or setting points
map.on('draw:created', function(e) {
    drawcreated(e, map, geojsondiv, drawGroup);
});

/******************************************************************************/

/* UPLOAD */
// The only other event that matters, user loads shp file, i populate map
input.setAttribute("onchange", "onUpload()");
function onUpload() {
    loadshapefile(map, geojsondiv, drawGroup, input, icon_alt);
}

global.window.onUpload = onUpload;

/******************************************************************************/

/* SWITCH LAYER */
// radio button events
map.on('baselayerchange', function(e) {
    window.base_event = e;
    basechange(e, map, drawGroup);
});

/******************************************************************************/

window.map = map;
