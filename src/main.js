import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // No assets to load for minimal example
  }

  create() {
    // Detect if mobile device
    this.isMobile = this.sys.game.device.os.android || 
                    this.sys.game.device.os.iOS || 
                    this.sys.game.device.os.iPad || 
                    this.sys.game.device.os.iPhone ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Create platforms group (static physics bodies)
    this.platforms = this.physics.add.staticGroup();

    // Create floor - full width at bottom
    const floor = this.add.rectangle(400, 580, 800, 40, 0x4a4a4a);
    this.platforms.add(floor);

    // Create some platform blocks
    const platform1 = this.add.rectangle(200, 450, 150, 20, 0x6b8e23);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(500, 350, 120, 20, 0x6b8e23);
    this.platforms.add(platform2);

    const platform3 = this.add.rectangle(650, 250, 100, 20, 0x6b8e23);
    this.platforms.add(platform3);

    const platform4 = this.add.rectangle(100, 200, 140, 20, 0x6b8e23);
    this.platforms.add(platform4);

    // Refresh the static group to recognize the new bodies
    this.platforms.refresh();

    // Create player character (blue block)
    this.player = this.add.rectangle(100, 500, 32, 48, 0x0066ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // Add collision between player and platforms
    this.physics.add.collider(this.player, this.platforms);

    // Add instructional text
    if (this.isMobile) {
      this.text = this.add.text(10, 10, 'Use buttons to play', {
        fontSize: '16px',
        fill: '#ffffff'
      });
    } else {
      this.text = this.add.text(10, 10, 'Arrow keys to move, Space to jump', {
        fontSize: '16px',
        fill: '#ffffff'
      });
    }

    // Setup keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.moveSpeed = 200;
    this.jumpVelocity = -800;

    // Mobile touch controls
    this.mobileControls = {
      left: false,
      right: false,
      jump: false
    };

    if (this.isMobile) {
      this.createMobileButtons();
    }
  }

  createMobileButtons() {
    const buttonY = 550;
    const buttonSize = 60;
    
    // Left button
    this.leftButton = this.add.rectangle(80, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setInteractive();
    this.leftButton.setDepth(100);
    
    const leftText = this.add.text(80, buttonY, '←', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    leftText.setScrollFactor(0);
    leftText.setDepth(101);

    this.leftButton.on('pointerdown', () => {
      this.mobileControls.left = true;
      this.leftButton.setFillStyle(0x666666, 0.9);
    });
    this.leftButton.on('pointerup', () => {
      this.mobileControls.left = false;
      this.leftButton.setFillStyle(0x444444, 0.7);
    });
    this.leftButton.on('pointerout', () => {
      this.mobileControls.left = false;
      this.leftButton.setFillStyle(0x444444, 0.7);
    });

    // Right button
    this.rightButton = this.add.rectangle(160, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setInteractive();
    this.rightButton.setDepth(100);
    
    const rightText = this.add.text(160, buttonY, '→', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    rightText.setScrollFactor(0);
    rightText.setDepth(101);

    this.rightButton.on('pointerdown', () => {
      this.mobileControls.right = true;
      this.rightButton.setFillStyle(0x666666, 0.9);
    });
    this.rightButton.on('pointerup', () => {
      this.mobileControls.right = false;
      this.rightButton.setFillStyle(0x444444, 0.7);
    });
    this.rightButton.on('pointerout', () => {
      this.mobileControls.right = false;
      this.rightButton.setFillStyle(0x444444, 0.7);
    });

    // Jump button
    this.jumpButton = this.add.rectangle(720, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setInteractive();
    this.jumpButton.setDepth(100);
    
    const jumpText = this.add.text(720, buttonY, '↑', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    jumpText.setScrollFactor(0);
    jumpText.setDepth(101);

    this.jumpButton.on('pointerdown', () => {
      this.mobileControls.jump = true;
      this.jumpButton.setFillStyle(0x666666, 0.9);
    });
    this.jumpButton.on('pointerup', () => {
      this.mobileControls.jump = false;
      this.jumpButton.setFillStyle(0x444444, 0.7);
    });
    this.jumpButton.on('pointerout', () => {
      this.mobileControls.jump = false;
      this.jumpButton.setFillStyle(0x444444, 0.7);
    });
  }

  update() {
    // Horizontal movement - keyboard or mobile
    if (this.cursors.left.isDown || this.mobileControls.left) {
      this.player.body.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.mobileControls.right) {
      this.player.body.setVelocityX(this.moveSpeed);
    } else {
      this.player.body.setVelocityX(0);
    }

    // Jumping - keyboard or mobile, only if on ground or platform
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.mobileControls.jump) && 
        this.player.body.touching.down) {
      this.player.body.setVelocityY(this.jumpVelocity);
      if (this.mobileControls.jump) {
        this.mobileControls.jump = false; // Prevent continuous jumping
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

const game = new Phaser.Game(config);
