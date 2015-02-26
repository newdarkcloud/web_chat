var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io')

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'public')));

io.on('connection', function (socket) {
  socket.emit('welcome', { hello: 'world' });
  socket.on('ping server', function (data) {
    var now = new Date();
    socket.emit('pong server', {date : now.toDateString()});
  });

  var serverMessage = function(){
    var now = new Date();
    socket.emit("server time", {time : now.toTimeString()});
    
    setTimeout(serverMessage, 5000);
  };
  
  serverMessage();

});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});