import Phaser from 'phaser';
import { LevelGeometry } from './LevelGeometry.js';
import { RandomLevelBuilder } from './RandomLevelBuilder.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.currentLevel = 1;
  }

  preload() {
    // Load alien character sprites
    this.load.image('alienStand', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_stand.png');
    this.load.image('alienWalk1', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_walk1.png');
    this.load.image('alienWalk2', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_walk2.png');
    this.load.image('alienJump', 'sprites/Extra animations and enemies/Alien sprites/alienBeige_jump.png');
    
    // Load platform and door tiles
    this.load.image('platform', 'sprites/Base pack/Tiles/grassMid.png');
    this.load.image('floor', 'sprites/Base pack/Tiles/grassMid.png');
    this.load.image('doorClosed', 'sprites/Base pack/Tiles/door_closedMid.png');
    this.load.image('doorTop', 'sprites/Base pack/Tiles/door_closedTop.png');
  }

  create() {
    // Detect if mobile device
    this.isMobile = this.sys.game.device.os.android || 
                    this.sys.game.device.os.iOS || 
                    this.sys.game.device.os.iPad || 
                    this.sys.game.device.os.iPhone ||
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Generate level
    this.levelGeometry = new LevelGeometry();
    this.levelGeometry.generate();
    this.levelBuilder = new RandomLevelBuilder(this);
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;

    // Create player character (alien sprite)
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player = this.physics.add.sprite(startPos.x, startPos.y, 'alienStand');
    this.player.body.setGravityY(800);
    this.player.setScale(0.8); // Adjust size if needed

    // Create animations for the player
    this.anims.create({
      key: 'walk',
      frames: [
        { key: 'alienWalk1' },
        { key: 'alienWalk2' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'alienStand' }],
      frameRate: 10
    });

    this.anims.create({
      key: 'jump',
      frames: [{ key: 'alienJump' }],
      frameRate: 10
    });

    // Add collision between player and platforms
    this.physics.add.collider(this.player, this.platforms);

    // Expand world bounds to allow camera scrolling
    const worldWidth = 3200;
    const worldHeight = 2400;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
    // Setup camera to follow player smoothly
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    // Add level counter and instructional text
    if (this.isMobile) {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nUse buttons to play`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
      this.text.setScrollFactor(0); // Keep text fixed to camera
    } else {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nArrow keys to move, Space to jump`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
      this.text.setScrollFactor(0); // Keep text fixed to camera
    }

    // Setup keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.moveSpeed = 200;
    this.jumpVelocity = -600;

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

  nextLevel() {
    this.currentLevel++;
    
    // Clean up old objects
    if (this.platforms) {
      this.platforms.clear(true, true);
    }
    if (this.door) {
      this.door.destroy();
    }
    
    // Regenerate level
    this.levelGeometry = new LevelGeometry();
    this.levelGeometry.generate();
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;
    
    // Reset player position
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.player.body.setVelocity(0, 0);
    
    // Update text
    this.text.setText(this.isMobile ? 
      `Level ${this.currentLevel}\nUse buttons to play` : 
      `Level ${this.currentLevel}\nArrow keys to move, Space to jump`);
    
    // Re-add collision
    this.physics.add.collider(this.player, this.platforms);
  }

  update() {
    // Horizontal movement - keyboard or mobile
    if (this.cursors.left.isDown || this.mobileControls.left) {
      this.player.body.setVelocityX(-this.moveSpeed);
      this.player.setFlipX(true); // Face left
      if (this.player.body.touching.down) {
        this.player.anims.play('walk', true);
      }
    } else if (this.cursors.right.isDown || this.mobileControls.right) {
      this.player.body.setVelocityX(this.moveSpeed);
      this.player.setFlipX(false); // Face right
      if (this.player.body.touching.down) {
        this.player.anims.play('walk', true);
      }
    } else {
      this.player.body.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play('idle', true);
      }
    }

    // Jumping - keyboard or mobile, only if on ground or platform
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.mobileControls.jump) && 
        this.player.body.touching.down) {
      this.player.body.setVelocityY(this.jumpVelocity);
      this.player.anims.play('jump', true);
      if (this.mobileControls.jump) {
        this.mobileControls.jump = false; // Prevent continuous jumping
      }
    }

    // Play jump animation when in air
    if (!this.player.body.touching.down && this.player.anims.currentAnim?.key !== 'jump') {
      this.player.anims.play('jump', true);
    }

    // Check for door collision
    if (this.door && this.physics.overlap(this.player, this.door)) {
      this.nextLevel();
    }

    // Keep player within horizontal world bounds
    const worldWidth = 3200;
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.body.setVelocityX(0);
    } else if (this.player.x > worldWidth) {
      this.player.x = worldWidth;
      this.player.body.setVelocityX(0);
    }
  }

  createMobileButtons() {
    const buttonY = 560;
    const buttonSize = 120;
    
    // Left button
    this.leftButton = this.add.rectangle(100, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setInteractive();
    this.leftButton.setDepth(100);
    
    const leftText = this.add.text(100, buttonY, '←', {
      fontSize: '64px',
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

    // Right button
    this.rightButton = this.add.rectangle(240, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setInteractive();
    this.rightButton.setDepth(100);
    
    const rightText = this.add.text(240, buttonY, '→', {
      fontSize: '64px',
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

    // Jump button
    this.jumpButton = this.add.rectangle(700, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setInteractive();
    this.jumpButton.setDepth(100);
    
    const jumpText = this.add.text(700, buttonY, '↑', {
      fontSize: '64px',
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
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  input: {
    activePointers: 3 // Enable up to 3 simultaneous touch points
  }
};

const game = new Phaser.Game(config);
