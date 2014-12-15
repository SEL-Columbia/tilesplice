var L = require('leaflet');

var locale = require('./tilesets.js').locale;
var localeOptions = require('./tilesets.js').localeOptions;

var Proj4js = require('proj4');

module.exports = function(map, geojsondiv, drawGroup, input, icon_alt) {
    var map = map,
        geojsondiv = geojsondiv,
        drawGroup = drawGroup,
        input   =   input,
        icon_alt = icon_alt;

    function loadPoints(geojson) {
    
        // draws markers
        function drawPoint(lat, lng, name, type) {
            var marker = new L.marker([lat, lng], {
                title: name,
                alt: name,
                icon: icon_alt,
                riseOnHover: true
            });
    
            return marker;
        };
    
        window.features = [];
        var dst = new Proj4js.Proj('EPSG:4326');
        L.geoJson(geojson, {
            onEachFeature: function (feature, layer) {
                //layer.bindPopup(feature.properties.description);
                window.features.push(feature)
                 
                var coords = feature.geometry.coordinates;
                var projection = feature.properties.projection;
                var map_name = feature.properties.map;
    
                // project point 
                if (projection) {
                    console.log(projection);
                    Proj4js.defs['TEMP'] = projection;
                    var src = new Proj4js.Proj('TEMP');
                    var point = new Proj4js.Point(coords);
                    console.log(point, coords);
                    Proj4js.transform(src, dst, point);
                    console.log(point, coords);
                    // save change
                    feature.geometry.coordinates = [point.x, point.y];
                    coords = feature.geometry.coordinates;
                }
    
                map.setView([coords[1], coords[0]], 14);
                var layer = drawPoint(coords[1], coords[0], map_name, map_name)
                drawGroup.addLayer(layer);;
            }
        });
        return 0;
    };

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
            var map_name = geojson.features[0].properties.map || "global";
            if (localeOptions[map_name]) {
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

};
