var image_proxy = require('..');

var express = require('express');
var app = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false, pretty: true});

  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use("/images", express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.get('/proxy', image_proxy.run);

app.get('/', function(req, res){
    res.render('index.jade');
});

app.listen(3000);

console.log( "Example server started on: http://localhost:3000" );