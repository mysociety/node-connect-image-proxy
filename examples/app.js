var image_proxy = require('./../image-proxy');

var express = require('express');
var app = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false, pretty: true});
  app.use("/images", express.static(__dirname + '/public'));
});


app.get('/image', image_proxy.run);

app.get('/test', function(req, res){
    res.render('test.jade');
});

app.listen(3000);