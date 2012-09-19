# Middleware for proxying and manipulating images

This module allows you to manipulate and convert images on the fly.

It provides:

  * Resizing of images
  * Conversion of images to grayscale
  * Conversion of images into different formats
  * Only proxies images from the same domain that the proxy is running on - not an open proxy (this could be easily changed in future)


## Installation & Configuration

    npm install connect-image-proxy

You may have to install graphicsmagick too:

    apt-get install graphicsmagick

and then in your code (eg an Express app):

    var ImageProxy = require('connect-image-proxy');

    app.configure(function(){
      ....

      var myproxy = new ImageProxy({
        hostsWhitelist: ['mysite.com', 'images.mysite.com'],
        headers: {'Cache-Control': 'max-age=31536000'},
      });

      // mount the proxy at '/proxy'
      app.use( '/proxy', myproxy.requestHandler );
      ....
    });

### Configuration Options

  * validMimeTypes: list of valid MIME types.  Defaults to ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].
  * hostsWhitelist: list of allowed hosts.  If not set, defaults to serving requests only for images on the same host as this server.
  * headers: map of http headers to their values.  Note that Content-Type is always set to the appropriate MIME type.


## Usage

  * Resize: hostname/route/?url=[url]&resize=1&height=[height]&width=[width]
  * Grayscale: hostname/route/?url=[url]&grayscale=1
  * Conversion [JPG, PNG, GIF]: hostname/route/?url=[url]&format=[format]
  * Conversion + Grayscale + Resize: hostname/route/?url=[url]&format=png&grayscale=1&resize=1&height=[height]&width=[width]


## Example app

There is an example app in the `examples` folder that demonstrates the basic features.


## TODO

  * pass along headers by default?
