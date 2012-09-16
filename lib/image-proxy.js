var
    fs            = require('fs'),
    // path          = require('path'),
    mime          = require('mime'),
    url           = require('url'),
    http          = require('http'),
    gm            = require('gm'),
    temp          = require('temp');
    // request       = require('request');


function ImageProxy(opts) {

  var validMimeTypes = {
    'image/jpeg': true,
    'image/png':  true,
    'image/gif':  true,
    'image/jpg':  true,
  };

  var headers = {};

  var restrictToLocal = true;
  var hostsWhitelist = {};

  if (opts.headers) {
    headers = opts.headers;
  }

  if (opts.validMimeTypes) {
    validMimeTypes = listToObj(opts.validMimeTypes);
  }

  if (opts.hostsWhitelist) {
    restrictToLocal = false;
    hostsWhitelist = listToObj(opts.hostsWhitelist);
  }

  function listToObj(list) {
    var ret = {};
    for (var i=0; i < list.length; i++) {
      ret[list[i]] = true;
    }
    return ret;
  }

  this.requestHandler = function(req, res, next) {
    // get the remote url. If none given abort request
    var remoteUrl = req.param('url');
    if (! remoteUrl) {
      return res.send("No 'url' parameter specified, can't proxy", 500);
    }

    // Turn paths into full urls. Assume that the host and port should be the
    // same as the request's, and the protocol 'http'.
    var urlObject = url.parse(remoteUrl);
    if ( ! urlObject.hostname ) {
      hostFromHeader = url.parse( 'http://' + req.headers.host );
      urlObject.hostname = hostFromHeader.hostname;
      urlObject.host     = hostFromHeader.host;
      urlObject.port     = hostFromHeader.port;
      urlObject.protocol = hostFromHeader.protocol;
    }

    // In future perhaps allow user to provide a whitelist of hosts to proxy for
    if (restrictToLocal) {
      if( urlObject.host != req.headers.host ) {
        return res.send(
          "Will only proxy requests to " + req.headers.host + ", not " + urlObject.host,
          500
        );
      }
    }
    else if (!(urlObject.host in hostsWhitelist)) {
        return res.send(
          "Invalid host.",
          500
        );
    }

    var handleImageResponse = function (imageResponse) {

      // check that the response is acceptable. Should be a 200.
      if ( imageResponse.statusCode != 200 ) {
        res.send('url ' + remoteUrl + ' did not return 200', 500);
        return;
      }

      // get the mime type from the response, check it is accetpable
      var mimeType = imageResponse.headers['content-type'];
      if ( ! validMimeTypes[mimeType] ) {
        res.send('Can not handle mime type ' + mimeType, 500);
        return;
      }

      var fileExt       = mime.extension( mimeType );
      var tempImageFile = temp.path({suffix: '.'+fileExt});
      var writeStream   = fs.createWriteStream(tempImageFile);

      imageResponse
        .on('data', function (chunk) {
          writeStream.write(chunk);
        })
        .on('end', function() {
          writeStream.end(function() {

            var image = gm( tempImageFile );

            if( req.param('resize') ) {
              var newWidth  = req.param('width')  || '';
              var newHeight = req.param('height') || '';

              if( !newHeight && !newWidth) {
                res.send('need one of height and/or width to resize', 500);
                return;
              }

              image = image.resize(newWidth + 'x' + newHeight);
            }

            if ( req.param('grayscale')) {
              image = image.type('grayscale');
            }

            if ( req.param('format') ) {
              image    = image.setFormat( req.param('format') );
              mimeType = req.param('format');
            }

            // all done - render the image
            image.stream( function (err, stdout, stderr) {
              if (err) {
                console.error(err);
                return next(err);
              }
              stderr.pipe(process.stderr);

              headers['Content-Type'] = mimeType;
              res.writeHead(200, headers);

              // pipe the output straight to the response.
              stdout.pipe(res);

              // at the end delete the temporary file.
              stdout.on("end", function() {
                fs.unlink(tempImageFile);
              });

            });
          });
        });

    };

    // request the remote url
    http
      .get(urlObject, handleImageResponse)
      .on('error', next );

  }
}

module.exports = ImageProxy;
