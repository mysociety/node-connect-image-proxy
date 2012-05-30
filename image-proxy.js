var express       = require('express'),
fs                = require('fs'),
path              = require('path'),
gm                = require('gm');

var server = express.createServer();

var image_proxy = function(imagePath){

    if(imagePath == undefined)
        imagePath = "\img\\";

    server.get('/image', function(req, res, next){

        var url = req.param('url');

        // Add support for remote files by downloading the remote file to the images directory
        fs.stat(url, function(err, stat) {

            if (!err) {

                var outputImage = gm(url);
                var imageExt = path.extname(url);

                if(req.param('resize') == 1)
                {
                    var newWidth = req.param('width');
                    var newHeight = req.param('height');

                    if(newHeight == null && newWidth == null)
                        throw("Atleast one parameter from height or width should be defined.");
                    else
                    {
                        outputImage = outputImage.resize(newWidth, newHeight);
                    }
                }

                if(req.param('grayscale') == 1)
                {
                    outputImage = outputImage.type('grayscale');
                }

                outputImage.stream(renderImage);

            }else {
                throw err;
            }
        });

        function renderImage(err, stdout, stderr) {

            res.setHeader('Content-type', 'image/jpeg');

            stdout.on('data', function(chunk) {
                res.write(chunk);
            });
            stdout.on('end', function() {
                res.end();
            });
        }
    });

    return server;
};

exports.server = image_proxy;