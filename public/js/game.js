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

  this.load.image('pLayership', 'assets/spaceShips_001.png');
  this.load.image('TheOtherOne', 'assets/enemyBlack5.png');
  this.load.image('pickingupThingy', 'assets/pickingupThingy_gold.png');
}

function create() {

  var self = this;
  this.socket = io();
  this.TheOtherOnes = this.physics.add.group();

//  this.game.stage.backgroundColor = 'rgb(124, 185, 232)';//

  this.socket.on('pLayersingame', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addTheOtherOnes(self, players[id]);
      }
    });
  });
  this.socket.on('noobie', function (playerInfo) {
    addTheOtherOnes(self, playerInfo);
  });


  this.socket.on('disconnect', function (playerId) {
    self.TheOtherOnes.getChildren().forEach(function (TheOtherOne) {
      if (playerId === TheOtherOne.playerId) {
        TheOtherOne.destroy();
      }
    });
  });


  this.socket.on('playerMoved', function (playerInfo) {
    self.TheOtherOnes.getChildren().forEach(function (TheOtherOne) {
      if (playerInfo.playerId === TheOtherOne.playerId) {
        TheOtherOne.setRotation(playerInfo.rotation);
        TheOtherOne.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });


    this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  this.socket.on('sCoreboardupdate', function (sCoreBoard) {
    self.blueScoreText.setText('Blue: ' + sCoreBoard.blue);
    self.redScoreText.setText('Red: ' + sCoreBoard.red);
  });

  this.socket.on('pickingupThingyLocation', function (pickingupThingyLocation) {
    if (self.pickingupThingy) self.pickingupThingy.destroy();
    self.pickingupThingy = self.physics.add.image(pickingupThingyLocation.x, pickingupThingyLocation.y, 'pickingupThingy');
    self.physics.add.overlap(self.pLayership, self.pickingupThingy, function () {
      this.socket.emit('pickingupThingyCollected');
    }, null, self);
  });
    }


function update() {
  if (this.pLayership) {
    if (this.cursors.left.isDown) {
      this.pLayership.setAngularVelocity(-150);
      console.log("Left betton is pressed")
    } else if (this.cursors.right.isDown) {
      this.pLayership.setAngularVelocity(150);
      console.log("Right betton is pressed")
    } else {
      this.pLayership.setAngularVelocity(0);
    }

    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.pLayership.rotation + 1.5, 100, this.pLayership.body.acceleration);
    } else {
      this.pLayership.setAcceleration(0);
    }


    var x = this.pLayership.x;//player movement
    var y = this.pLayership.y;
    var r = this.pLayership.rotation;
    if (this.pLayership.oldPosition && (x !== this.pLayership.oldPosition.x || y !== this.pLayership.oldPosition.y || r !== this.pLayership.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.pLayership.x, y: this.pLayership.y, rotation: this.pLayership.rotation });
    }
    // save old position data
    this.pLayership.oldPosition = {
      x: this.pLayership.x,
      y: this.pLayership.y,
      rotation: this.pLayership.rotation
    };
    this.physics.world.wrap(this.pLayership, 5);


  }

}

function addPlayer(self, playerInfo) {
  self.pLayership = self.physics.add.image(playerInfo.x, playerInfo.y, 'pLayership').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    self.pLayership.setTint(0x0000ff);
  } else {
    self.pLayership.setTint(0xff0000);
  }
  self.pLayership.setDrag(100);
  self.pLayership.setAngularDrag(100);
  self.pLayership.setMaxVelocity(200);
}

function addTheOtherOnes(self, playerInfo) {
  const TheOtherOne = self.add.sprite(playerInfo.x, playerInfo.y, 'TheOtherOne').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    TheOtherOne.setTint(0x0000ff);
  } else {
    TheOtherOne.setTint(0xff0000);
  }
  TheOtherOne.playerId = playerInfo.playerId;
  self.TheOtherOnes.add(TheOtherOne);
}
