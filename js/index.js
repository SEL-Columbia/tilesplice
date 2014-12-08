/* INIT */
// ma map
var map = L.map('map', { 
    center: [20.9, 96.15],
    zoom:  12,
});

// background layer
// landsat
var bg_layer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
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
    var validMarkers = [["POINT", "MAP", "LAT", "LNG"]];
    var counter = 0;
    var drawLayer = drawGroup;

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

    drawLayer.eachLayer(function(layer) {
        var latlng = layer._latlng;
        window.lay = layer;
        if  (   (latlng.lng < bot_x && latlng.lng > top_x)
            &&  (latlng.lat < top_y && latlng.lat > bot_y) ) {

            var geopoint = ["POINT", locale, latlng.lat, latlng.lng]
            validMarkers.push(geopoint);
        }
    });

    if (validMarkers.length > 1) {
        req.open("POST", "/download.csv", true);
        console.log(JSON.stringify({'csv': validMarkers}));
        req.send(JSON.stringify({'csv': validMarkers}));
    }

}
/******************************************************************************/

/* UPLOAD */
var loadPoints = function(layer, csv) {
    if (!localeOptions[layer]) {
        alert("layer doesn't exist");
        return 1;
    }

    //var drawLayer = localeOptions[layer].draw;

    for (i=1; i < csv.length; i++) {
        var marker = L.marker([ csv[i][2], csv[i][3]]);
        drawGroup.addLayer(marker);
        map.setView([ csv[i][2], csv[i][3]], 14);
    }

    return 0;
}

// Handle upload
var postFile = function() {
    if (input.files.length < 3) {
        return;
    }
    
    var fd = new FormData();

    var shx = null;
    var shp = null;
    var dbf = null;

    for(i = 0; i < input.files.length; i++) {
        var suffix_arr = input.files[i].name.split(".");
        var suffix = suffix_arr[suffix_arr.length - 1];
        switch(suffix) {
            case "shp":
                  shp = input.files[i];
                  break;
            case "shx":
                  shx = input.files[i];
                  break;

            case "dbf":
                  dbf = input.files[i];
                  break;
            default:
                  break;
        }
    }

    
    if (!(shp && shx && dbf)) {
        alert("missing somefile");
        return;
    }

    fd.append("shx", shx);
    fd.append("shp", shp);
    fd.append("dbf", dbf);

    // ajax req to update layer
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            var csv = JSON.parse(req.responseText).csv;
            var layer_name = csv[0][1];
            var num_pts = csv.length - 1;
            var err = loadPoints(layer_name, csv);
            if (err) 
                return;

            geojsondiv.innerHTML += "<p id='loaded'> Loaded: "
                + num_pts + " for layer " + layer_name
                + "</p>";
        }
    }
    
    req.open("POST", "/upload.shp", true);
    req.send(fd);
}
/******************************************************************************/

/* Utils */
var swapDrawControl = function(newLocale) {


    drawControl.removeFrom(map);

    drawControl = new L.Control.Draw({
        draw: allowedShapes, 
        edit: {
                featureGroup: localeOptions[newLocale].draw
              }
    });

    localeOptions[locale].draw.bringToBack(map);
    localeOptions[newLocale].draw.bringToFront(map);

    map.addControl(drawControl);
}

var loadFeatureGroups = function(start) {
    Object.keys(localeOptions).forEach(function(locale) {
        localeOptions[locale].draw.addTo(map);
        localeOptions[locale].draw.bringToBack(map);
    });

    localeOptions[locale].draw.bringToFront(map);
}

// radio button events
map.on('baselayerchange', function(e) {
        //swapDrawControl(e.name); groups dont work as i expected
        locale = e.name; 
        var layer = e.layer;
        var cen = localeOptions[locale].cen;
        var zom = localeOptions[locale].zom;
        map.setView(cen, zom);

        //TODO: change feature group
});
/******************************************************************************/

//loadFeatureGroups();
window.map = map;
