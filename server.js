var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io');

/*
I'm not a world-class node expert, so most of the above was different 
and I settled on using the setup that cloud9 offered as default.

Express is the content delivery system, http is used for the actual
request handling, socketio will be our websockets, path is for letting 
express route subdirectories to subdirectories it isn't needed here but it is 
useful all the same.  I'm not using async...
*/

/*These get the server going although it doesn't yet have a port 
to listen to.  That part is at the bottom.*/
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

/* This is a slick line, it tells our express instance to 
serve static content from the public folder and to resolve 
path names rather than be complicated.  So a GET request to / will 
get index.html out of the public directory.  A GET request to 
/folder1 would try or folder1's index file. */
router.use(express.static(path.resolve(__dirname, 'public')));

/*
  socketio works on events and callbacks, as does most node code.
  The "connection" event is sent from a client to the server when 
  they first connect.  The callback function is then fired and passed
  a handler for the socket they share.
*/

io.on('connection', function (socket) {
  //socket.emit will send a message to the client, the data can be
  // whatever you would like.
  socket.emit('welcome', { hello: 'world' });
  //this socket should also listen for the "ping server" event.
  //my event names (other than connection) are made up.
  socket.on('ping server', function (data) {
    var now = new Date();
    //I wasn't sure if "pong server" was a good name for the 
    //response event but I'm sending down the date on the server
    socket.emit('pong server', {date : now.toDateString()});
  });

  //this is proof of concept code, it will run once every 5 seconds 
  // (for each client).  It sends the server's time down.
  var serverMessage = function(){
    var now = new Date();
    socket.emit("server time", {time : now.toTimeString()});
    
    setTimeout(serverMessage, 5000);
  };
  
  //this starts the forever loop
  serverMessage();

});

//this is where we actually turn to the outside world.  You'll need 
//to adjust if you are on some other server.
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});