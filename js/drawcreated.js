var L = require('leaflet');
var Proj4js = require('proj4');

var locale = require('./tilesets.js').locale;
var localeOptions = require('./tilesets.js').localeOptions;

module.exports = function(e, map, geojsondiv, drawGroup) {
    var map = map;
    var geojsondiv = geojsondiv;
    var drawGroup = drawGroup;
    var source = localeOptions[locale].src;
    var tile_layer = localeOptions[locale].layer;
    var dest = localeOptions[locale].dest;
    var isWeb = localeOptions[locale].web;

    var type = e.layerType;
    var layer = e.layer;

    var dumpMarks = function(top_x, top_y, bot_x, bot_y) {
    
        // Set up ajax request, update console with shp file location on success;
        var req = null;
        req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
    
                var url1 = "http://" + window.location.host + "/" + req.responseText + "dbf";
                var url2 = "http://" + window.location.host + "/" + req.responseText + "sbx";
                var url3 = "http://" + window.location.host + "/" + req.responseText + "shp";
                geojsondiv.innerHTML += "<p id='shps'>" + url1 + "</p>";
                geojsondiv.innerHTML += "<p id='shps'>" + url2 + "</p>";
                geojsondiv.innerHTML += "<p id='shps'>" + url3 + "</p>";
            }
        }
    
        var pointsGeoJson = drawGroup.toGeoJSON();
        var validFeatures = [];
        var lat;
        var lng;
        var counter = 0;
        var curTiles = locale;
    
        // loop though featureGroup geojson, record points that are within bounds
        for (i=0; i < pointsGeoJson.features.length; i++) {
            var lat = pointsGeoJson.features[i].geometry.coordinates[1];
            var lng = pointsGeoJson.features[i].geometry.coordinates[0];
            var type = pointsGeoJson.features[i].geometry.type;
    
            if  ((lng < bot_x && lng > top_x) &&  (lat < top_y && lat > bot_y)) {
    
                counter++;
                // add in properties now
                pointsGeoJson.features[i].properties.map = curTiles;
                validFeatures.push(pointsGeoJson.features[i]);
            }
        };
    
        // update features list
        delete pointsGeoJson.features;
        pointsGeoJson.features = validFeatures;
    
        if (pointsGeoJson.features.length > 0) {
            req.open("POST", "/download.geojson?raster="+curTiles, true);
            console.log(JSON.stringify(pointsGeoJson));
            req.send(JSON.stringify(pointsGeoJson));
        }
    };

    if (type === 'rectangle') {
        var latlngs = layer.getLatLngs();

        // point
        var ptop = latlngs[1];
        var pbot = latlngs[3];

        // labels
        window.setTimeout(
            dumpMarks(ptop.lng, ptop.lat, pbot.lng, pbot.lat),
        100);
           
        if (isWeb) {
            var popup = L.popup({closeOnClick: false})
                .setLatLng([(ptop.lat + pbot.lat)/2, (ptop.lng + pbot.lng)/2])
                .setContent('<p> Clipping from web tilesets not enabled </p>')
                .addTo(map);
            return;
        }

        // projected point
        var pptop = new Proj4js.Point(ptop.lng, ptop.lat);
        var ppbot = new Proj4js.Point(pbot.lng, pbot.lat);

        //pop up
        var popup = L.popup({closeOnClick: false})
            .setLatLng([(ptop.lat + pbot.lat)/2, (ptop.lng + pbot.lng)/2])
            .setContent('<p> Clipping GeoTiff ... </p>')
            .addTo(map);

        Proj4js.transform(source, dest, pptop);
        Proj4js.transform(source, dest, ppbot);

        var get = "?top_x=" + pptop.x 
                + "&top_y=" + pptop.y
                + "&bot_x=" + ppbot.x
                + "&bot_y=" + ppbot.y
                + "&image=" + locale;


        var req = null;
        req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                popup.setContent('<a href="' + req.responseText 
                                + '">'
                                + req.responseText
                                + '</a>');
                var url = "http://" + window.location.host + "/" + req.responseText;
                geojsondiv.innerHTML += "<p id='clip'>" + url + "</p>";
            }

        }

        req.open("GET", "/clip.tif" + get, true);
        req.send();

        map.addLayer(layer);
    } else if (type === 'marker') {
        // just setting points
        drawGroup.addLayer(layer);
    }

};
