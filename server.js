var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    exec = require('child_process').exec,
    port = process.argv[2] || 8888;
 
http.createServer(function(request, response) {

    var url_parts = url.parse(request.url, true);
    var uri = url_parts.pathname;
    var query = url_parts.query;

    console.log(uri);

    var filename = path.join(process.cwd(), uri);

    if (uri === "/clip.tif") {
        console.log("request");

        var clipper = "python clippers/range_clipper.py";
        var geo_tiff = "myanmar.tif";
        var top_x = "200821.400",  
            top_y = "2316187.200", 
            bot_x = "204283.900", 
            bot_y = "2313922.700";

        // TODO get rid of the shit above
        if (JSON.stringify(query) !== "{}") {
            console.log(query);
            top_x = query.top_x;
            top_y = query.top_y;
            bot_x = query.bot_x;
            bot_y = query.bot_y;
            geo_tiff = query.image + ".tif";
        }

        var geo_name = geo_tiff.split(".")[0];
        var out_tiff = geo_name 
                        + ".out." 
                        + Math.floor(top_x) 
                        +"." 
                        + Math.floor(top_y)
                        + ".tif"; 

        var command = clipper 
                + " " + geo_tiff
                + " " + top_x
                + " " + top_y
                + " " + bot_x
                + " " + bot_y;
                
        console.log(command);
        console.log(command);
        console.log(command);

        exec(command, function(err, stdout, stderr) {
                
                if (err) {
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.write("BUSTEDDD \n" + JSON.stringify(err));
                    response.end();
                    return;
                }

                console.log(err);
                console.log(stdout);
                console.log(stderr);
                console.log(geo_tiff);
                console.log(out_tiff);

                fs.exists(out_tiff, function(exists) {

                    if(!exists) {        
                        response.writeHead(500, {"Content-Type": "text/plain"});
                        response.write("Could not create geo-tiff\n");
                        response.end();
                        return;
                    }

                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write(out_tiff);
                    response.end();
                });
            });

        return;
    }

    // SERVE
    fs.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
