var map = L.map('map').setView([20.9, 96.15], 12);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

    
// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    draw: {
            polyline: false,
            polygon: false,
            rectangle: {},
            circle: false,
            marker: false
          },
    edit: {
            featureGroup: drawnItems
          }
});

// Add in our projection
Proj4js.defs["EPSG:32647"] = "+proj=utm +zone=47 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

// default lat lng proj
var source = new Proj4js.Proj('EPSG:4326');  

// Trasverse Mercator
var dest = new Proj4js.Proj('EPSG:32647');  

// src , dest , point - > our projection
var point = new Proj4js.Point(96.15, 20.9);

// dest, src, endpoint -> lat/lng
var endpoint = new Proj4js.Point(200821.400, 2316187.200);

// GDAL INFO totally useless right now
var outputProj = 'PROJCS["WGS 84 / UTM zone 47N",'
    + 'GEOGCS["WGS 84",'
    + '    DATUM["WGS_1984",'
    + '        SPHEROID["WGS 84",6378137,298.257223563,'
    + '            AUTHORITY["EPSG","7030"]],'
    + '        AUTHORITY["EPSG","6326"]],'
    + '    PRIMEM["Greenwich",0],'
    + '    UNIT["degree",0.0174532925199433],'
    + '    AUTHORITY["EPSG","4326"]],'
    + 'PROJECTION["Transverse_Mercator"],'
    + 'PARAMETER["latitude_of_origin",0],'
    + 'PARAMETER["central_meridian",99],'
    + 'PARAMETER["scale_factor",0.9996],'
    + 'PARAMETER["false_easting",500000],'
    + 'PARAMETER["false_northing",0],'
    + 'UNIT["metre",1,'
    + '    AUTHORITY["EPSG","9001"]],'
    + 'AUTHORITY["EPSG","32647"]]'

map.addControl(drawControl);

// Transverse Mercator UTM North 32647
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

var g_layer = L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        minZoom: 1,
        maxZoom: 18
})

map.on('draw:created', function(e) {
    console.log(e);
    console.log(this);

    var type = e.layerType;
    var layer = e.layer;
    var latlngs = layer.getLatLngs();

    window.layer = layer;
    window.th = this;
    // point
    var ptop = latlngs[1];
    var pbot = latlngs[3];

    // projected point
    var pptop = new Proj4js.Point(ptop.lng, ptop.lat);
    var ppbot = new Proj4js.Point(pbot.lng, pbot.lat);

    //pop uo
    var popup = L.popup()
        .setLatLng([(ptop.lat + pbot.lat)/2, (ptop.lng + pbot.lng)/2])
        .setContent('<p> Clipping GeoTiff ... </p>')
        .addTo(map);

    console.log(pptop, ppbot);
    Proj4js.transform(source, dest, pptop);
    Proj4js.transform(source, dest, ppbot);
    console.log(pptop, ppbot);

    var get = "?top_x=" + pptop.x 
            + "&top_y=" + pptop.y
            + "&bot_x=" + ppbot.x
            + "&bot_y=" + ppbot.y;


    var req = null;
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            //document.body.innerHTML = req.responseText;
            popup.setContent('<a href="' + req.responseText 
                            + '"> Download '
                            + '(' + Math.floor(ptop.lat*100)/100 + ', ' 
                            + Math.floor(ptop.lng*100)/100 + ')' 
                            + ' to '
                            + '(' + Math.floor(pbot.lat*100)/100 + ', ' 
                            + Math.floor(pbot.lng*100)/100 + ')' 
                            + '</a>');
        }
    }

    req.open("GET", "/clip.tif" + get, true);
    req.send();
    console.log(req.responseText);
    map.addLayer(layer);
});

// quick way finder, hard to find tile region when zoomed out
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


//osm_layer.addTo(map);
g_layer.addTo(map);
myanmar_layer.addTo(map);
window.map = map;
