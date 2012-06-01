var image_proxy = require('./image-proxy');

var express = require('express');
var app = express.createServer();

app.get('/image', image_proxy.run);

app.get('/test', function(req, res){
    res.render('test.jade', { layout: false });
});

app.listen(3000);