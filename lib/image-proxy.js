var fs            = require('fs'),
path              = require('path'),
mime              = require('mime'),
url               = require('url'),
http              = require('http'),
gm                = require('gm'),
temp              = require('temp');

module.exports = function () {
  return function image_proxy (req, res){
    
    var remoteUrl = decodeURI(req.param('url'));
    var urlObject = url.parse(remoteUrl);
    var options = urlObject;
    var fileExt = path.extname(remoteUrl);
    var urlHost = urlObject.hostname;

    var tempImageFile = temp.path({suffix: fileExt});

    if(urlObject.port != undefined)
         urlHost += ":"+urlObject.port;

    // In future perhaps allow user to provide a whitelist of hosts to proxy for
    if(urlHost != req.headers.host)
        throw('Error: Only local proxy allowed.' +  urlHost + "  " + req.headers.host);
    
    http.get(options, function(image_res) {

        var file = fs.createWriteStream(tempImageFile);

        image_res.on('data', function(data) {
            file.write(data);
        }).on('end', function() {

            file.end();

            if(!validateMime(tempImageFile))
                throw "Error: Unsupported file type.";

            var outputImage = gm(tempImageFile);

            if(req.param('resize') == 1)
            {
                var newWidth = req.param('width');
                var newHeight = req.param('height');

                if(newHeight == null && newWidth == null)
                    throw("At least one parameter from height or width should be defined.");
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
        });

    }).on('error', function(e) {
        throw('File cannot be downloaded: ' + e.message)
    });

    function renderImage(err, stdout, stderr) {

        res.setHeader('Content-type', 'image/' + fileExt.substring(1));

        stdout.on('data', function(chunk) {
            res.write(chunk);
        });
        stdout.on('end', function() {
            res.end();

            // delete the temporary image, not needed anymore
            fs.unlink(tempImageFile, function (err) {
              if (err) throw err;
            });

            
        });
    }

  };
};

function validateMime(name)
{
    var type = mime.lookup(name);
    var validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

    if(validTypes.indexOf(type) == -1)
        return false;
    else
        return true;
}
