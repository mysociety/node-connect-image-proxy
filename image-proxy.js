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
        var imageType;
        
        // Add support for remote files by downloading the remote file to the images directory
        fs.stat(url, function(err, stat) {

            if (!err) {

                var outputImage = gm(url);
                imageType = path.extname(url).substring(1);

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

                if(req.param('format') != undefined)
                {
                    outputImage = outputImage.setFormat(req.param('format'));
                    imageType = req.param('format');
                }

                outputImage.stream(renderImage);

            }else {
                throw err;
            }
        });

        function renderImage(err, stdout, stderr) {

            res.setHeader('Content-type', 'image/' + imageType);

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