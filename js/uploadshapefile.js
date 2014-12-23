var L = require('leaflet');

var Proj4js = require('proj4');

var editor = require('./editor.js');

var map = editor.map,
    drawGroup = editor.drawGroup,
    dom = editor.dom,
    icon_alt = editor.icon_alt;

var logger = dom.log,
    input = dom.input;

var Request = require('./request.js');

module.exports = function() {

    function loadPoints(geojson) {
    
        // draws markers
        function drawPoint(lat, lng, name, props) {
            delete props.projection;
            var marker = new L.marker([lat, lng], {
                title: JSON.stringify(props, null, 2),
                alt: name,
                icon: icon_alt,
                riseOnHover: true
            });
    
            marker.metadata = props;
            return marker;
        };
    

        function drawPoly(points, name, type) {
            var latlngs = [];
            points.forEach(function(point) {
                latlngs.push(new L.latLng(point[1], point[0]));
                //console.log(point);
            });

            //console.log(latlngs);
            window.pts = latlngs;
            var poly = new L.polygon(latlngs, {
                color: "#FF9900",
            });

            return poly;
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
                var type = feature.geometry.type;
    
                if (type === "Point") {
                    // project point 
                    if (projection) {
                        //TODO: loop through coord pairs and alter projection
                        Proj4js.defs([['TEMP', projection]]);
                        var src = new Proj4js.Proj('TEMP');
                        var point = new Proj4js.Point(coords);
                        Proj4js.transform(src, dst, point);
                        // save change
                        feature.geometry.coordinates = [point.x, point.y];
                        coords = feature.geometry.coordinates;
                    }
    
                    map.setView([coords[1], coords[0]], 14);
                    var layer = drawPoint(coords[1], coords[0], map_name, feature.properties);
                } else if (type === "Polygon") {

                    if (projection) {
                        var new_coords = [];
                        coords[0].forEach(function(coord) {
                            Proj4js.defs([['TEMP', projection]]);
                            var src = new Proj4js.Proj('TEMP');
                            var point = new Proj4js.Point(coord);
                            Proj4js.transform(src, dst, point);
                            new_coords.push([point.x, point.y]);
                        });

                        coords[0] = new_coords
                    };

                    map.setView([coords[0][0][1], coords[0][0][0]], 14);
                    var layer = drawPoly(coords[0], map_name, map_name)
                }

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
    var req = new Request();
    req
        .create_request("POST", "/upload.shp", true)
        .set_response_handler(function() {
            var geojson = JSON.parse(req.response_text());
            var length =  geojson.features.length;
            if (length < 1) {
                return;
            }
            var map_name = geojson.features[0].properties.map || "global";
            if (editor.localeOptions[map_name]) {
                var props = {name: map_name, layer: editor.localeOptions[map_name].layer}
                //var event = new L.LayersControlEvent("baselayerchange", props);
                //document.dispatchEvent(event);
                //XXX: THIS
            }

            loadPoints(geojson);
            
            logger.innerHTML += "<p id='loadlabel'> Loaded </p>"
                + "<p id='loaded'>"+ length + " to active layer " + editor.locale + "</p>";
        })
        .send(fd);
};
