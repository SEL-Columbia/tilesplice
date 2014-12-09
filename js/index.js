/* INIT */
// ma map
var map = L.map('map', { 
    center: [20.9, 96.15],
    zoom:  12,
});

// background layer
var bg_layer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        // landsat
        minZoom: 1,
        maxZoom: 18,
})
bg_layer.addTo(map);

//XXX: locale, localeOptions, baseMap are all set in tilesets

// start layer (is in baseMaps)
localeOptions[locale].layer.addTo(map);
var drawGroup = new L.FeatureGroup();
drawGroup.addTo(map);

// Base Map
L.control.layers(baseMaps).addTo(map);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var allowedShapes = {
    polyline: false,
    polygon: false,
    rectangle: {
        clickable: false
    },
    circle: false,
    marker: {
        repeatMode: true,
        editing: true
    }
};

var drawControl = new L.Control.Draw({
    draw: allowedShapes, 
    edit: {
            featureGroup: drawGroup
          }
});

map.addControl(drawControl);

// Basically a log for events that happened
var geojsondiv = document.getElementById('geojson');

// Set up upload button
var inputdiv = document.getElementById('upload');
var input = document.createElement("INPUT");
input.setAttribute("type", "file");
input.setAttribute("name", "uploads[]");
input.name = "uploads[]";
input.setAttribute("multiple", true);
input.setAttribute("onchange", "postFile()");
inputdiv.appendChild(input);

// best I can do sadly, i want to simulate radio button events`
//
// radio button events
map.on('baselayerchange', function(e) {
    window.eii = e;
    swapLayer(e);
});
/******************************************************************************/

/* DOWNLOAD */
// The only event that matters, drawing a box, or setting points
map.on('draw:created', function(e) {
    var source = localeOptions[locale].src;
    var tile_layer = localeOptions[locale].layer;
    var dest = localeOptions[locale].dest;
    var isWeb = localeOptions[locale].web;

    var type = e.layerType;
    var layer = e.layer;

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

});

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

}
/******************************************************************************/

/* UPLOAD */
var loadPoints = function(geojson) {

    // draws markers
    function drawPoint(lat, lng, name, type) {
        var marker = new L.marker([lat, lng], {
            title: name,
            alt: name,
            riseOnHover: true
        });

        return marker;
    };

    // for drawing circles
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#FF0000",
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    

    L.geoJson(geojson, {
        onEachFeature: function (feature, layer) {
            //layer.bindPopup(feature.properties.description);
            var coords = feature.geometry.coordinates;
            map.setView([coords[1],coords[0]], 14);
            //var layer = drawPoint(coords[1]. coords[0]. "myanmar pt", "house")
            drawGroup.addLayer(layer);;
        },
        // for drawing circles
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });
    return 0;
}

// Handle upload
var postFile = function() {
    if (input.files.length < 2) {
        return;
    }
    
    var fd = new FormData();

    var shx = null;
    var shp = null;
    var dbf = null;
    var prj = null;

    for(i = 0; i < input.files.length; i++) {
        var suffix_arr = input.files[i].name.split(".");
        var suffix = suffix_arr[suffix_arr.length - 1];
        switch(suffix) {
            case "shp":
                  shp = input.files[i];
                  fd.append("shp", shp);
                  break;
            case "shx":
                  shx = input.files[i];
                  fd.append("shx", shx);
                  break;
            case "dbf":
                  dbf = input.files[i];
                  fd.append("dbf", dbf);
                  break;

            case "prj":
                  prj = input.files[i];
                  fd.append("prj", prj);
                  break;
            default:
                  break;
        }
    }
    
    if (!shp || !dbf) {
        alert("Require at least a shp and a dbf file to be submitted");
        return;
    }


    // ajax req to update layer
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            var geojson = JSON.parse(req.responseText);
            var length =  geojson.features.length;
            if (length < 1) {
                return;
            }
            var map_name = geojson.features[0].properties.map || "None";
            if (localeOptions[map_name]) {
                // I know this one!
                console.log("HERE");
                console.log("HERE");
                var props = {name: map_name, layer: localeOptions[map_name].layer}
                //var event = new L.LayersControlEvent("baselayerchange", props);
                //document.dispatchEvent(event);
            }

            var err = loadPoints(geojson);
            if (err) 
                return;

            geojsondiv.innerHTML += "<p id='loaded'> Loaded: "
                + length + " for layer " + map_name
                + "</p>";
        }
    }
    
    req.open("POST", "/upload.shp", true);
    req.send(fd);
}
/******************************************************************************/

/* Utils */
var swapDrawGroup = function(newLocale) {
    localeOptions[locale].draw = drawGroup.getLayers();
    drawGroup.clearLayers();
    localeOptions[newLocale].draw.forEach(function(layer) {
        drawGroup.addLayer(layer);
    });;
}

var loadFeatureGroups = function(start) {
    Object.keys(localeOptions).forEach(function(locale) {
        localeOptions[locale].draw.addTo(map);
        localeOptions[locale].draw.bringToBack(map);
    });

    localeOptions[locale].draw.bringToFront(map);
}

var swapLayer = function(e) {
        swapDrawGroup(e.name); 
        locale = e.name; 
        var layer = e.layer;
        var cen = localeOptions[locale].cen;
        var zom = localeOptions[locale].zom;
        map.setView(cen, zom);
}
/******************************************************************************/

window.map = map;
