var locale = require('./tilesets.js').locale;
var localeOptions = require('./tilesets.js').localeOptions;
var editor = require('./editor.js');

var map = editor.map,
    drawGroup = editor.drawGroup;

module.exports = function(e) {
    var new_locale = e.name;

    // swap feature group layers
    localeOptions[locale].draw = drawGroup.getLayers();
    drawGroup.clearLayers();
    localeOptions[new_locale].draw.forEach(function(layer) {
        drawGroup.addLayer(layer);
    });

    // set new locale, zoom in to defined center
    locale = new_locale; 
    var layer = e.layer;
    var cen = localeOptions[locale].cen;
    var zom = localeOptions[locale].zom;
    map.setView(cen, zom);
};
