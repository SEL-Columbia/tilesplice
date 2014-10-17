var map = L.map('map').setView([20.9, 96.15], 12);
var myanmar_layer = L.tileLayer('myanmar_copy/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 18,
        attribution: 'ESO/INAF-VST/OmegaCAM',
        tms: true
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
