var L = require('leaflet');
var Proj4js = require('proj4');

var editor = require('./editor.js');

var map = editor.map,
    drawGroup = editor.drawGroup,
    dom = editor.dom;

var logger = dom.log;

var Request = require('./request.js');

module.exports = function(e) {
    var source = editor.localeOptions[editor.locale].src;
    var tile_layer = editor.localeOptions[editor.locale].layer;
    var dest = editor.localeOptions[editor.locale].dest;
    var isWeb = editor.localeOptions[editor.locale].web;

    var type = e.layerType;
    var layer = e.layer;

    layer.metadata = {};
    layer.metadata['map'] = editor.locale;

    function dump_marks(top_x, top_y, bot_x, bot_y) {
    
        var pointsGeoJson = drawGroup.toGeoJSON();
        var validFeatures = [];
        var lat;
        var lng;
        var counter = 0;
        var curTiles = editor.locale;
    
        // loop though featureGroup geojson, record points that are within bounds
        for (i=0; i < pointsGeoJson.features.length; i++) {
            var type = pointsGeoJson.features[i].geometry.type;

            // Only dump points
            if (type !== "Point") {
                continue;
            }

            var lat = pointsGeoJson.features[i].geometry.coordinates[1];
            var lng = pointsGeoJson.features[i].geometry.coordinates[0];
    
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

            // Set up ajax request, update console with shp file location on success;
            var req = new Request();
            req
                .create_request("POST", "/download.geojson?raster="+curTiles, true)
                .set_response_handler(function() {
                    var url = "http://" + window.location.host + "/" + req.response_text();
                    logger.innerHTML += "<p id='shplabel'> Point DBF </p>" 
                        + "<a href="+url+"dbf id='shps'>"+url+"dbf</a>";
                    logger.innerHTML += "<p id='shplabel'> Point SHX </p>" 
                        + "<a href="+url+"shx id='shps'>"+url+"shx</a>";
                    logger.innerHTML += "<p id='shplabel'> Point SHP </p>" 
                        + "<a href="+url+"shp id='shps'>"+url+"shp</a>";
                })
                .send(JSON.stringify(pointsGeoJson));
            }
    };

    function dump_poly(polyGeoJson) {
    
        var curTiles = editor.locale;
        polyGeoJson = {'type': 'FeatureCollection', 'features': [polyGeoJson] };
        // Set up ajax request, update console with shp file location on success;
        console.log(polyGeoJson);
        console.log(JSON.stringify(polyGeoJson));
        window.p = polyGeoJson;
        var req = new Request();
        req
            .create_request("POST", "/download.geojson?raster="+curTiles, true)
            .set_response_handler(function() {
                var url = "http://" + window.location.host + "/" + req.response_text();
                logger.innerHTML += "<p id='shplabel'> Polygon DBF </p>" 
                    + "<a href="+url+"dbf id='shps'>"+url+"dbf</a>";
                logger.innerHTML += "<p id='shplabel'> Polygon SHX </p>" 
                    + "<a href="+url+"shx id='shps'>"+url+"shx</a>";
                logger.innerHTML += "<p id='shplabel'> Polygon SHP </p>" 
                    + "<a href="+url+"shp id='shps'>"+url+"shp</a>";
            })
            .send(JSON.stringify(polyGeoJson));
    };

    if (type === 'rectangle') {
        var latlngs = layer.getLatLngs();

        // point
        var ptop = latlngs[1];
        var pbot = latlngs[3];

        // labels
        window.setTimeout(
            dump_marks(ptop.lng, ptop.lat, pbot.lng, pbot.lat),
        100);
           
        // shutdown geotiff creation if just a web tileset
        if (isWeb) {
            var popup = L.popup({closeOnClick: true})
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
                + "&image=" + editor.locale;


        var req = new Request();
        req
            .create_request("GET", "/clip.tif" + get, true)
            .set_response_handler(function() {
                popup.setContent('<a href="' + req.response_text()
                                + '">'
                                + req.response_text()
                                + '</a>');
                var url = "http://" + window.location.host + "/" + req.response_text();
                logger.innerHTML += "<p id='geolabel'> GeoTiff </p>" 
                    + "<a href="+url+" id='clip'>" + url + "</a>";

            })
            .send();

        drawGroup.addLayer(layer); //XXX: dont add this layer to the map directly
    } else if (type === 'marker') {
        // just setting points
        drawGroup.addLayer(layer);
    } else if (type === 'markertooltip') {
        window.mark = layer;
        var counter = 0;
        var metadata = prompt("Metadata:", "");
        while(metadata) { 
            layer.metadata['meta'+counter++] = metadata;
            metadata = prompt("Metadata:", "");
        }

        layer.options.title = JSON.stringify(layer.metadata, null, 2); 
        drawGroup.addLayer(layer);

    } else if (type === 'polygon') {
        drawGroup.addLayer(layer);
        dump_poly(layer.toGeoJSON());
        // dump?
    } else {
        console.log(type);
    };

};
