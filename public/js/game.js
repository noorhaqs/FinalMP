var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1500,
  height: 800,
  backgroundColor: 'rgb(124, 185, 232)',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
this.load.image('Playership', 'assets/roundish.png');
this.load.image('TheOtherOne', 'assets/circleee.png');
}

function create() {

  var self = this;
  this.socket = io();
  this.TheOthrOnee = this.physics.add.group();

//  this.game.stage.backgroundColor = 'rgb(124, 185, 232)';//

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addTheOthrOnee(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addTheOthrOnee(self, playerInfo);
  });


  this.socket.on('disconnect', function (playerId) {
    self.TheOthrOnee.getChildren().forEach(function (TheOtherOne) {
      if (playerId === TheOtherOne.playerId) {
        TheOtherOne.destroy();
      }
    });
  });


this.socket.on('playerMoved', function (playerInfo) {
  self.TheOthrOnee.getChildren().forEach(function (TheOtherOne) {
    if (playerInfo.playerId === TheOtherOne.playerId) {
      TheOtherOne.setRotation(playerInfo.rotation);
      TheOtherOne.setPosition(playerInfo.x, playerInfo.y);
    }
  });
});


  this.cursors = this.input.keyboard.createCursorKeys();

this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

this.socket.on('scoreUpdate', function(scores) {
  self.blueScoreText.setText('Blue: ' + scores.blue);
  self.redScoreText.setText('Red: ' + scores.red);
});
  }

function update() {
if (this.Playership) {
    if (this.cursors.left.isDown) {
      this.Playership.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.Playership.setAngularVelocity(150);
    } else {
      this.Playership.setAngularVelocity(0);
    }

    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.Playership.rotation + 1.5, 100, this.Playership.body.acceleration);
    } else {
      this.Playership.setAcceleration(0);
    }
    var x = this.Playership.x;
    var y = this.Playership.y;
    var r = this.Playership.rotation;
    if (this.Playership.oldPosition && (x !== this.Playership.oldPosition.x || y !== this.Playership.oldPosition.y || r !== this.Playership.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.Playership.x, y: this.Playership.y, rotation: this.Playership.rotation });
}

this.Playership.oldPosition = {
  x: this.Playership.x,
  y: this.Playership.y,
  rotation: this.Playership.rotation
};
    this.physics.world.wrap(this.Playership, 5);
  }

}

function addPlayer(self, playerInfo) {
  self.Playership = self.physics.add.image(playerInfo.x, playerInfo.y, 'Playership').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    self.Playership.setTint(0x0000ff);
  } else {
    self.Playership.setTint(0xff0000);
  }
  self.Playership.setDrag(100);
  self.Playership.setAngularDrag(100);
  self.Playership.setMaxVelocity(200);
}

function addTheOthrOnee(self, playerInfo) {
  const TheOtherOne = self.add.sprite(playerInfo.x, playerInfo.y, 'TheOtherOne').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    TheOtherOne.setTint(0x0000ff);
  } else {
    TheOtherOne.setTint(0xff0000);
  }
  TheOtherOne.playerId = playerInfo.playerId;
  self.TheOthrOnee.add(TheOtherOne);
}
