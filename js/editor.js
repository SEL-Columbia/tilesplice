var Proj4js = require('proj4');
var L = require('leaflet');
require('leaflet-draw');
require('./leaflet-mods.js');

var tilesets = require('./tilesets.js');

module.exports = (function() {
    var locale = tilesets.locale;
    var localeOptions = tilesets.localeOptions;
    var baseMaps = tilesets.baseMaps;

    var icon_alt = new L.icon({
        iconUrl: "css/images/icon-orange.png",
        iconSize: [25, 41],
        iconAnchor: [11.5, 39]
    });
    
    var icon_def = new L.icon({
        iconUrl: "css/images/icon-default.png",
        iconSize: [25, 41],
        iconAnchor: [11.5, 39]
    });

    function init_map(url) {

        var map = L.map('map', { 
                center: [20.9, 96.15],
            zoom:  12,
        });

        // landsat
        //var bg_url = url || 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        //var bg_layer = L.tileLayer(bg_url, {
        //        minZoom: 1,
        //        maxZoom: 17,
        //});
        //bg_layer.addTo(map);

        // start layer (is in baseMaps)
        localeOptions[locale].layer.addTo(map);

        // Base Map
        L.control.layers(baseMaps).addTo(map);

        return map;
    };

    function init_draw_controllers(map) {

        // Feature group will contain all marker layers
        var drawGroup = new L.FeatureGroup();
        drawGroup.addTo(map);

        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var allowedShapes = {
            polygon: {
                allowIntersection: false,
                shapeOptions: {
                    color: "#0000FF", 
                },
            },
            polyline: false,
            markertooltip: {
                repeatMode: true,
                editing: true,
                icon: icon_alt
            },
            rectangle: {
                shapeOptions: {
                    clickable: false
                },
                editing: false,
            },
            circle: false,
            marker: {
                repeatMode: true,
                editing: true,
                icon: icon_def
            }
        };

        var drawControl = new L.Control.Draw({
            draw: allowedShapes, 
            edit: {
                    featureGroup: drawGroup
                  }
        });
        
        map.addControl(drawControl);

        return drawGroup;
    };


    function init_dom(map) {
        // Basically a log for events that happened
        var logger = document.getElementById('logger');
        
        // Set up upload button
        var inputdiv = document.getElementById('upload');
        var input = document.createElement("INPUT");
        input.setAttribute("type", "file");
        input.setAttribute("name", "uploads[]");
        input.setAttribute("class", "leaflet-container leaflet-retina");
        input.name = "uploads[]";
        input.setAttribute("multiple", true);
        inputdiv.appendChild(input);

        return {
            log: logger,
            input: input
        };
    };

    var _map = init_map();

    return {
        icon_alt: icon_alt,
        icon_def: icon_def,
        drawGroup: init_draw_controllers(_map),
        dom: init_dom(_map),
        locale: locale,
        localeOptions: localeOptions,
        map: _map
    };

})();
