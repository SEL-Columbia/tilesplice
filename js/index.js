var g_layer = L.tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        minZoom: 1,
        maxZoom: 18
})

var l_layer = L.tileLayer('http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        minZoom: 1,
        maxZoom: 18,
})


// ma map
var map = L.map('map', { 
    center: [20.9, 96.15],
    zoom:  12,
});

var drawnItems = new L.FeatureGroup();
drawnItems.addTo(map);

l_layer.addTo(map);
initial_layer.addTo(map);
L.control.layers(baseMaps).addTo(map);

// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw({
    draw: {
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
          },
    edit: {
            featureGroup: drawnItems
          }
});

map.addControl(drawControl);

var geojsondiv = document.getElementById('geojson');

// The only event that matters
map.on('draw:created', function(e) {
    console.log(e);
    console.log(this);

    var source = localeOptions[locale].src;
    var dest = localeOptions[locale].dest;

    var type = e.layerType;
    var layer = e.layer;

    if (type === 'rectangle') {
        var latlngs = layer.getLatLngs();

        // point
        var ptop = latlngs[1];
        var pbot = latlngs[3];

        // labels
        dumpMarks(ptop.lng, ptop.lat, pbot.lng, pbot.lat);
        
        // projected point
        var pptop = new Proj4js.Point(ptop.lng, ptop.lat);
        var ppbot = new Proj4js.Point(pbot.lng, pbot.lat);

        //pop uo
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
                geojsondiv.innerHTML += "<p>" + url + "</p>";
            }
        }

        req.open("GET", "/clip.tif" + get, true);
        req.send();

        map.addLayer(layer);
    } else if (type === 'marker') {
        drawnItems.addLayer(layer);
    }

});

var dumpMarks = function(top_x, top_y, bot_x, bot_y) {
    var validMarkers = [];
    var counter = 0;

    var req = null;
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
    if (req.readyState == 4) {
        popup.setContent('<a href="' + req.responseText 
              + '">'
              + req.responseText
              + '</a>');
        }
     }


    drawnItems.eachLayer(function(layer) {
        var latlng = layer._latlng;
        if  (   (latlng.lng < bot_x && latlng.lng > top_x)
            &&  (latlng.lat < top_y && latlng.lat > bot_y) ) {

            var geopoint = "" + latlng.lat + ", " + latlng.lat + ", Label: " + counter++;
            geojsondiv.innerHTML += "<p>" + geopoint + "</p>";
            validMarkers.push();
        }

        console.log(validMarkers);
    });

   //req.open("GET", "/labels" + get, true);
   //req.send();

}
// radio button events
map.on('baselayerchange', function(e) {
        locale = e.name;
        var layer = e.layer;
        var cen = localeOptions[locale].cen;
        var zom = localeOptions[locale].zom;
        map.setView(cen, zom);
});

window.map = map;
