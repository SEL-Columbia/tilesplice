// CSS changes made as well
module.exports = (function() {
    // new tooltip
    L.Draw.MarkerToolTip = L.Draw.Marker.extend({
        initialize: function (map, options) {
            this.type = 'markertooltip';

            L.Draw.Feature.prototype.initialize.call(this, map, options);
        },

        addHooks: function () {
            L.Draw.Marker.prototype.addHooks.call(this);

            if (this._map) {
                this._tooltip.updateContent({ text: 'Click map to place marker with properties input.' });
            }
        }
    });

    // update toolbar handler to include new tool 
    L.DrawToolbar.include({
        getModeHandlers: function (map) {
            return [
                {
                    enabled: this.options.marker,
                    handler: new L.Draw.Marker(map, this.options.marker),
                    title: L.drawLocal.draw.toolbar.buttons.marker
                },
                {
                    enabled: this.options.markertooltip,
                    handler: new L.Draw.MarkerToolTip(map, this.options.markertooltip),
                    title: 'Place marker with tooltip'
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
            ];
        }
    });

    // allows me to add properties to 
    var markerToGeoJSON = L.Marker.prototype.toGeoJSON;
    L.Marker.include({
        toGeoJSON: function() {
            var feature = markerToGeoJSON.call(this);
            feature.properties = this.metadata;
            return feature;
        }
    });
})();
