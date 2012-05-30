
/**
 * Module dependencies.
 */

var image_proxy = require('./image-proxy');

image_proxy.server().listen(3000, function(){
    console.log("Express server listening");
});