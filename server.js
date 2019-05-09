var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected'); // A new player object is being created whenever a user connects//
  players[socket.id] = {//player object contains player id, location x, y and also what team its in//
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };

  socket.emit('currentPlayers', players); //
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', function () {
    console.log('user disconnected'); //removes player and sends the message to the entire server//
    delete players[socket.id];
    io.emit('disconnect', socket.id);
  });

  socket.on('playerMovement', function (movementData) {//handles player movement, x and y coordinates are taken here//
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;

  socket.broadcast.emit('playerMoved', players[socket.id]); // Broadcast.emit sends message to all other clients other than the new connection here//
});
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
