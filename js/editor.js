var Proj4js = require('proj4');
var L = require('leaflet');
require('leaflet-draw');

var tilesets = require('./tilesets.js');

module.exports = (function() {
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


    L.Draw.MarkerToolTip = L.Draw.Marker.extend({
        initialize: function (map, options) {
            this.type = 'MarkerToolTip';

            L.Draw.Feature.prototype.initialize.call(this, map, options);
        },

        addHooks: function () {
            L.Draw.Marker.prototype.addHooks.call(this);

            if (this._map) {
                this._tooltip.updateContent({ text: 'Click map to place marker with properties input.' });
            }
        }
    });

    L.DrawToolbar.include({
        getModeHandlers: function (map) {
            return [
                {
                    enabled: this.options.marker,
                    handler: new L.Draw.Marker(map, this.options.marker),
                    title: L.drawLocal.draw.toolbar.buttons.marker
                },
                {
                    enabled: this.options.polyline,
                    handler: new L.Draw.Polyline(map, this.options.polyline),
                    title: L.drawLocal.draw.toolbar.buttons.polyline
                },
                {
                    enabled: this.options.polygon,
                    handler: new L.Draw.Polygon(map, this.options.polygon),
                    title: L.drawLocal.draw.toolbar.buttons.polygon
                },
                {
                    enabled: this.options.rectangle,
                    handler: new L.Draw.Rectangle(map, this.options.rectangle),
                    title: L.drawLocal.draw.toolbar.buttons.rectangle
                },
                {
                    enabled: this.options.circle,
                    handler: new L.Draw.Circle(map, this.options.circle),
                    title: L.drawLocal.draw.toolbar.buttons.circle
                },
                {
                    enabled: this.options.markertooltip,
                    handler: new L.Draw.MarkerToolTip(map, { icon: icon_alt}),
                    title: 'Place marker with tooltip'
                }
            ];
        }
    });

    var locale = tilesets.locale;
    var localeOptions = tilesets.localeOptions;
    var baseMaps = tilesets.baseMaps;

    function init_map(url) {

        var map = L.map('map', { 
                center: [20.9, 96.15],
            zoom:  12,
        });

        // landsat
        var bg_url = url || 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        var bg_layer = L.tileLayer(bg_url, {
                minZoom: 1,
                maxZoom: 18,
        });
        bg_layer.addTo(map);

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
            polyline: false,
            polygon: false,
            markertooltip: true,
            rectangle: {
                clickable: false
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
