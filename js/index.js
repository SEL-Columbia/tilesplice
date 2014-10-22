var map = L.map('map').setView([20.9, 96.15], 12);



var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    edit: {
            featureGroup: drawnItems
          }
});

map.addControl(drawControl);

//var bounds = [[20.89, 96.14], [20.91, 96.16]];
//var rectangle = L.rectangle(bounds, {color: '#FF7800', weight: 1})
//            .addTo(map)

var marker = L.marker([20.9, 96.15], {
    clickable: true,
    draggable: true
})
        .addTo(map)
        //.bindPopup(marker.getLatLng())
        .on('drag', function(e) {
            console.log(this._latlng.lat, this._latlng.lng)
            //this.getPopup()
            //    .setContent("<p>" + e.latlng +"</p>");
        });


//var popup = L.popup()
//        .setLatLng(latlng)
//        .setContent('<p>Hello world!<br />This is a nice popup.</p>')
//        .openOn(map);


var myanmar_layer = L.tileLayer('../myanmar/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 18,
        attribution: 'modilabs',
        tms: true    //this is important
})
var osm_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        minZoom: 1,
        maxZoom: 18
})
var g_layer =
L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        minZoom: 1,
        maxZoom: 18
})
//osm_layer.addTo(map);
g_layer.addTo(map);
myanmar_layer.addTo(map);
window.map = map;
