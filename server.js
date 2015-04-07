
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var amqp = require('amqp');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static')
// var io = require('socket.io');
var rabbit = require('rabbit.js');

var app = express();

app.set('port', process.env.PORT || 3000);
console.log( 'port:', app.get('port') );
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(serveStatic(path.join(__dirname, 'public')));


app.connectionStatus = 'No server connection';
app.exchangeStatus = 'No exchange established';
app.queueStatus = 'No queue established';    

app.get('/', function(req, res){
  console.log('check this out');
  res.render('index.jade',
    {
      title: 'Welcome to RabbitMQ and Node/Express on AppFog',
      connectionStatus: app.connectionStatus,
      exchangeStatus: app.exchangeStatus,
      queueStatus: app.queueStatus
    });
});

app.post('/start-server', function(req, res){
  console.log('start server fn');
  var conexObj = { 
    url: 'amqp://localhost',
    host: 'amqp://localhost'
  }
  app.rabbitMqConnection = amqp.createConnection( conexObj );
  console.log(app.rabbitMqConnection);
  app.rabbitMqConnection.on('ready', function(){
    app.connectionStatus = 'Connected!';
    res.redirect('/');
  });
});

app.post('/new-exchange', function(req, res){
  app.e = app.rabbitMqConnection.exchange('test-exchange');
  app.exchangeStatus = 'The queue is ready to use!';
  res.redirect('/');
}); 

app.post('/new-queue', function(req, res){
  app.q = app.rabbitMqConnection.queue('test-queue');
  app.queueStatus = 'The queue is ready for use!';
  res.redirect('/');
});

app.get('/message-service', function(req, res){
  app.q.bind(app.e, '#');
  res.render('message-service.jade',
    {
      title: 'Welcome to the messaging service',
      sentMessage: ''
    });
});
      
http.createServer(app).listen(app.get('port'), function(){
  console.log("RabbitMQ + Node.js app running on AppFog!");
});

