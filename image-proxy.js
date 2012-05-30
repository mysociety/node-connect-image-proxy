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
        var action = req.param('action');

        // Add support for remote files by downloading the remote file to the images directory
        fs.stat(url, function(err, stat) {

            if (!err) {

                var imageExt = path.extname(url);

                switch(action)
                {
                    case 'resize':
                    {
                        var newWidth = req.param('width');
                        var newHeight = req.param('height');

                        if(newHeight == null && newWidth == null)
                            throw("Atleast one parameter from height or width should be defined.");
                        else
                        {
                            // resize & render
                            gm(url).resize(newWidth, newHeight).stream( function(err, stdout, stderr) {

                                res.setHeader('Content-type', 'image/jpeg');

                                stdout.on('data', function(chunk) {
                                    res.write(chunk);
                                });
                                stdout.on('end', function() {
                                    res.end();
                                });

                            });
                        }
                    }
                    break;
                    case 'grayscale':
                        //                            Grayscale
                        //                            gm("img.png").type('grayscale');
                        break;
                    default:
                        throw "Please define a valid action!";
                }

            }else {
                throw err;
            }
        });
    });

    return server;
};

//exports.imagePath = imagePath;
exports.server = image_proxy;