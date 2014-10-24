// Transverse Mercator UTM North 32647
var myanmar_layer = L.tileLayer('../myanmar/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 18,
        attribution: 'modilabs',
        tms: true    //this is important
})

var myanmar_feb_layer = L.tileLayer('../myanmar_feb/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 18,
        attribution: 'modilabs',
        tms: true    //this is important
})

var myanmar_jun_layer = L.tileLayer('../myanmar_jun/{z}/{x}/{y}.png', {
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

var baseMaps = {
    "myanmar": myanmar_layer,
    "myanmar_feb": myanmar_feb_layer,
    "myanmar_jun": myanmar_jun_layer
};

// ma map
var map = L.map('map', { 
    center: [20.9, 96.15],
    zoom:  12,
});

g_layer.addTo(map);
myanmar_layer.addTo(map);

L.control.layers(baseMaps).addTo(map);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

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

map.addControl(drawControl);

// Add in our projection
Proj4js.defs["EPSG:32647"] = "+proj=utm +zone=47 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

var locale = 'myanmar';

var localeOptions = {
    'myanmar': {
        layer: myanmar_layer,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        cen: [20.9, 96.15],
        zom: 12
    }, 
//    'myanmar_jan': {
//        layer: myanmar_layer,
//        src: new Proj4js.Proj('EPSG:4326'),
//        dest: new Proj4js.Proj('EPSG:32647'),
//        cen: [21.82838, 96.39941],
//        zom: 12
//    }, 
    'myanmar_feb': {
        layer: osm_layer,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        cen: [20.902, 96.157],
        zom: 12
    }, 
    'myanmar_jun': {
        layer: osm_layer,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        cen: [20.941, 96.090],
        zom: 12
    }
};


// The only event that matters
map.on('draw:created', function(e) {
    console.log(e);
    console.log(this);

    var source = localeOptions[locale].src;
    var dest = localeOptions[locale].dest;

    var type = e.layerType;
    var layer = e.layer;
    var latlngs = layer.getLatLngs();

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
            + "&bot_y=" + ppbot.y
            + "&image=" + locale;


    var req = null;
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            //document.body.innerHTML = req.responseText;
            popup.setContent('<a href="' + req.responseText 
                            + '"> Download '
                            + '(' + ptop.lat + ', ' 
                            + ptop.lng + ')' 
                            + ' to '
                            + '(' + pbot.lat + ', ' 
                            + pbot.lng + ')' 
                            + '</a>');
        }
    }

    req.open("GET", "/clip.tif" + get, true);
    req.send();
    console.log(req.responseText);
    map.addLayer(layer);
});

// radio button events
map.on('baselayerchange', function(e) {
        locale = e.name;
        var layer = e.layer;
        var cen = localeOptions[locale].cen;
        var zom = localeOptions[locale].zom;
        map.setView(cen, zom);

        window.lay = layer;
        window.me = name;
});

window.map = map;
