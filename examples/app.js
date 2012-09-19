var ImageProxy = require('..');

var express = require('express');
var app = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/views');
  app.set('view options', { layout: false, pretty: true});

  app.use(express.logger('dev'));
  app.use(express.favicon());
  app.use("/images", express.static(__dirname + '/public'));

  // Use the proxy
  var myproxy = new ImageProxy({
    hostsWhitelist: ['www.google.com', 'localhost:3000'],
    headers: {'Cache-Control': 'max-age=31536000'},
  });
  app.use('/proxy', myproxy.requestHandler);

  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.get('/', function(req, res){
  res.render('index.jade');
});

app.get('/no_suffix_jpg', function (req, res) {
  res.sendfile(__dirname + '/public/landscape.jpg');
});

app.listen(3000);

console.log( "Example server started on: http://localhost:3000" );
