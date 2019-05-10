var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var players = {};
var pickingupThingy = {
  x: (Math.random() * 700) + 50,
  y: (Math.random() * 500) + 50
};

var sCoreBoard = {
  blue: 0,
  red: 0
};


var eventemitter = require('events')
const emitter = new eventemitter()
emitter.setMaxListeners(100) //due a eventemitter memory leak, I increased the limit


io.on('connection', function (socket) {
  console.log('Player connected'); // A new player object is being created whenever a user connects//
  players[socket.id] = {//player object contains player id, location x, y and also what team its in//
    rotation: 0,
    x: (Math.random() * 1500) + 50,
    y: (Math.random() * 900) + 50,
    playerId: socket.id,
    team: ((Math.random() * 2) == 0) ? 'red' : 'blue'
  };

  socket.on('disconnect', function () {
    console.log('Player disconnected');//sends a message that a user has disconnected
    delete players[socket.id];
    io.emit('disconnect', socket.id); //asks the client for the socket id that got removed
  });

  socket.emit('pLayersingame', players);//feeding the location of other players
  socket.emit('pickingupThingyLocation', pickingupThingy);//feeding the location of the item to pick up
  socket.emit('sCoreboardupdate', sCoreBoard);//feeding/updating the score
  socket.broadcast.emit('noobie', players[socket.id]);//everybody except for the new player gets the update that a new player has joined


  socket.on('playerMovement', function(movementData) {//handles player movement, x and y coordinates are taken here//
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    socket.broadcast.emit('playerMoved', players[socket.id]);// Broadcast.emit sends message to all other clients other than the new connection here//
  });

  socket.on('pickingupThingyCollected', function () {
    if (players[socket.id].team === 'red') {//point system here
      sCoreBoard.red += 10;
    } else {
      sCoreBoard.blue += 10;
    }
    pickingupThingy.x = (Math.random() * 1500) + 50;
    pickingupThingy.y = (Math.random() * 900) + 50;
    io.emit('pickingupThingyLocation', pickingupThingy);
    io.emit('sCoreboardupdate', sCoreBoard);
        });
      });



server.listen(8080, function () {
  console.log(`Listening on ${server.address().port}`);
});
