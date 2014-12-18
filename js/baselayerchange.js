var editor = require('./editor.js');

var map = editor.map,
    drawGroup = editor.drawGroup;

module.exports = function(e) {
    var new_locale = e.name;

    // swap feature group layers
    editor.localeOptions[editor.locale].draw = drawGroup.getLayers();
    drawGroup.clearLayers();
    editor.localeOptions[new_locale].draw.forEach(function(layer) {
        drawGroup.addLayer(layer);
    });

    // set new locale, zoom in to defined center
    editor.locale = new_locale; 
    var layer = e.layer;
    var cen = editor.localeOptions[editor.locale].cen;
    var zom = editor.localeOptions[editor.locale].zom;
    //map.setView(cen, zom);
};
