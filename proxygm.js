var express       = require('express'),
fs                = require('fs'),
path              = require('path'),
gm                = require('gm');

//module.exports = function () {

var proxy_app = express.createServer();

proxy_app.get('/image', function(req, res, next){

    var url = req.param('url');
    var action = req.param('action');

    // Add support for remote files by downloading the remote file to the images directory
    fs.stat(url, function(err, stat) {

        if (!err) {

            var imageType = path.extname(url);
            var newFileName = "\images\\" + Math.floor(Math.random()*1000001) + imageType;

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
                        gm(url)
                        .resize(newWidth, newHeight)
                        .write(newFileName, function (err) {
                            if (!err)
                            {
                                renderNewImage(res);
                            }
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

            function renderNewImage(res)
            {
                // Set the appropriate headers
                res.setHeader('Content-type', 'image/jpeg');

                var filestream = fs.createReadStream(newFileName);
                filestream.on('data', function(chunk) {
                    // Stream the new file
                    res.write(chunk);
                });
                filestream.on('end', function() {
                    // Delete the temp file
//                    fs.unlinkSync(newFileName);  // Giving error 
                    res.end();                    
                });
            }

        }else {
            res.send(err);
        }
    });
});

//  return proxy_app;
//};

proxy_app.listen(3000, function(){
    console.log("Express server listening on port %d in %s mode", proxy_app.address().port, proxy_app.settings.env);
});