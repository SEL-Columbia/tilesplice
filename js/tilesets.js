/* Layers */
var Proj4js = require('proj4');
var L = require('leaflet');
require('leaflet-draw');
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

var myanmar_jan_layer = L.tileLayer('../myanmar_jan/{z}/{x}/{y}.png', {
        minZoom: 12,
        maxZoom: 18,
        attribution: 'modilabs',
        tms: true    //this is important
})

// Web layers
var g_layer = L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        minZoom: 1,
        maxZoom: 21,
        attribution: 'google',
})

var l_layer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 1,
        maxZoom: 17,
        attribution: 'nasa',
})

var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var o_layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 1, 
        maxZoom: 18, 
        attribution: osmAttrib
});

/* Active Layers */
var baseMaps = {
    "myanmar": myanmar_layer,
    "myanmar_feb": myanmar_feb_layer,
    "myanmar_jun": myanmar_jun_layer,
    "myanmar_jan": myanmar_jan_layer,
    "nasa_landsat": l_layer,
    "google_maps": g_layer,
    "osm": o_layer,
};

// Add in our projection
Proj4js.defs([["EPSG:32647", "+proj=utm +zone=47 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"]]);

/* Layer choices */
var locale = 'google_maps';
var localeOptions = {
    'myanmar': {
        layer: myanmar_layer,
        web: false,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.9, 96.15],
        zom: 12
    }, 
    'myanmar_jan': {
        layer: myanmar_jan_layer,
        web: false,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [21.82838, 96.39941],
        zom: 12
    }, 
    'myanmar_feb': {
        layer: myanmar_feb_layer,
        web: false,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.902, 96.157],
        zom: 12
    }, 
    'myanmar_jun': {
        layer: myanmar_jun_layer,
        web: false,
        src: new Proj4js.Proj('EPSG:4326'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.941, 96.090],
        zom: 12
    },

    'nasa_landsat': {
        layer: l_layer,
        web: true,
        src: new Proj4js.Proj('EPSG:32647'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.941, 96.090],
        zom: 12
    },

    'google_maps': {
        layer: g_layer,
        web: true,
        src: new Proj4js.Proj('EPSG:32647'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.941, 96.090],
        zom: 12
    },

    'osm': {
        layer: o_layer,
        web: true,
        src: new Proj4js.Proj('EPSG:32647'),
        dest: new Proj4js.Proj('EPSG:32647'),
        draw: new Array(),
        cen: [20.941, 96.090],
        zom: 12
    },
};

exports.locale = locale;
exports.localeOptions = localeOptions;
exports.baseMaps = baseMaps;
