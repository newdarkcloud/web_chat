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

/** Create "classes" for players and enemies
 */
 
function Player(name, hp, damage, id){
    this.name = name;
    this.hp = hp;
    this.damage = damage;
    this.id = id;
    player_id_count = player_id_count + 1;
}

function Enemy(name, hp, damage, id){
    this.name = name;
    this.hp = hp;
    this.damage = damage;
    this.id = id;
    enemy_id_count = enemy_id_count + 1;
}

function getPlayer(name){
    var p;
    var player = 0;
    for(p in playerList){
        if(playerList[p].name == name)
            player = playerList[p];
    }
    return player || 0;
}

function getEnemy(name){
    var p;
    var enemy = 0;
    for(p in enemyList){
        if(enemyList[p].name == name)
            enemy = enemyList[p];
    }
    return enemy || 0;
}

function randomBetween(min,max){
    var n = Math.floor((Math.random()*max)+min);
    return n;
}
var playerList = [];
var player_id_count = 0;

var enemyList = [];
var enemy_id_count = 0;
var player;
var enemy;

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

var socket_list = [];
io.on('connection', function (socket) {
    socket_list.push(socket);
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
  
    socket.on('outgoing message', function(data){
        data.time = (new Date()).toLocaleTimeString();
        if (data.user == "Jesus") data.user = "JJJJJJJJJJJJesus";
        //if user name not in playerList add it
        //typeof maybeObject != "undefined"
        var player = 0;
        
        console.log(playerList);
        var p;
    
        player = getPlayer(data.user);
        
        if(player==0){
            player = new Player(data.user,randomBetween(1,44),randomBetween(1,7),player_id_count);
            playerList.push(player);
        }
        
        if(player.hp < 0){
            if(data.message != "create new"){
                data.message = "Dead men tell no tales. Enter 'create new' to generate a new " + player.name + ".";
            }
          //playerList.splice(playerList.indexOf(player),1);
        }
        
        switch (data.message) {
            case "check health":
            case "check hp":
            case "check yourself":
            case "before you wreck yourself":
                data.message = "has " + player.hp + " health remaining.";
                break;
            case "check stats":
                data.message = "has " + player.hp + " health remaining, and " + player.damage + " strength.";
                break;
            case "":
                data.message = "chooses to remain silent";
                break;
            case "kill self":
            case "suicide":
            case "die":
            case "become an hero":
                data.message = "hast slain thyself";
                if (player.name != "JJJJJJJJJJJJesus") player.hp = -1 ;
                else data.message += ", but he's JJJJJJJJJJJJesus";
                break;
            case "create new":
                if(player.hp>=0){
                    data.message = "is still alive."
                }
                else{
                    player.hp = randomBetween(1,44);
                    player.damage = randomBetween(1,7);
                    data.message = "has been reborn.";
                }
                break;
            case "summon C'thulu":
                data.message = "awakens the Eldrich Gods";
                break;
            case "eldstar laugh":
                data.message = "WRHO HO HO";
                break;
            case "The 8 Button":
                data.message = "eight";
                break;
            case "contemplate life":
                data.message = "takes 9 emotional damage";
                break;
        }
    if (/^attack .+/i.test(data.message)) {
      var target = /^attack (.+)/i.exec(data.message)[1];
      console.log(target);
      //if enemy not in enemyList add it
      
      if(getPlayer(target) != 0){
        enemy = getPlayer(target);
      
        
      } else if(getEnemy(target) == 0){
        if(Math.random() <.99){
       enemyList.push(new Enemy(target,randomBetween(2,10),randomBetween(1,3),enemy_id_count));
        } else {
       enemyList.push(new Enemy(target,randomBetween(50,400),randomBetween(5,20),enemy_id_count));
        }
       enemy = getEnemy(target);
} else {
   enemy = getEnemy(target);
}
     
      console.log(enemy);
      console.log(player);
      
      if(enemy.hp < 0){
        data.message = "wishes to attack the " + target + ", but alas, it is already dead. Control thine bloodlust " + player.name + "!";
      } else {
      
      player.hp -= enemy.damage;
      enemy.hp -= player.damage;
     
     if(player.hp < 0 && enemy.hp < 0) {
       data.message = "has killed the " + target + ", and has been slain by it. How tragic.";
     } else if(enemy.hp >0){
        data.message = "is fighting a " + target + ". The "
        + target + " takes " + player.damage + " damage. " + player.name + " takes " +
        enemy.damage + " damage.";
        
        player.damage += 1;
        player.hp += randomBetween(2,6);
      } else if(player.hp <0){
        data.message = "has been killed by a " + target + ". " + target+ " takes " +
        player.damage + " damage from " + player.name + "'s killing blow.";
      }
    }
    }
    
    socket_list.forEach(function(out_socket,index,array){
      out_socket.emit("incoming message", data);
    });
    
  })

    //this is proof of concept code, it will run once every 5 seconds 
    // (for each client).  It sends the server's time down.
    var serverMessage = function(){
        var now = new Date();
        socket.emit("server time", {time : now.toTimeString()});
        //setTimeout(serverMessage, 5000);
    };
    
    //this starts the forever loop
    //serverMessage();

});

//this is where we actually turn to the outside world.  You'll need 
//to adjust if you are on some other server.
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});