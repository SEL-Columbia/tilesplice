var L = require('leaflet');
require('leaflet-draw');

var editor = require('./editor.js');

var basechange = require('./baselayerchange.js');
var drawcreated = require('./drawcreated.js');
var loadshapefile = require('./uploadshapefile.js');

/******************************************************************************/

/* DOWNLOAD */
// The only event that matters, drawing a box, or setting points
editor.map.on('draw:created', function(e) {
    drawcreated(e);
});

/******************************************************************************/

/* UPLOAD */
// The only other event that matters, user loads shp file, i populate map
editor.dom.input.setAttribute("onchange", "onUpload()");
function onUpload() {
    loadshapefile();
}

// Input needs function to be available globally
global.window.onUpload = onUpload;

/******************************************************************************/

/* SWITCH LAYER */
// Radio button events
editor.map.on('baselayerchange', function(e) {
    window.base_event = e;
    basechange(e);
});

/******************************************************************************/

window.editor = editor;
