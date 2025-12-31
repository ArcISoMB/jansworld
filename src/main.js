import Phaser from 'phaser';
import { LevelGeometry } from './LevelGeometry.js';
import { FirstLevel } from './FirstLevel.js';
import { RandomLevelBuilder } from './RandomLevelBuilder.js';
import { ChallengeDoor } from './entities/ChallengeDoor.js';
import { QuizChallenge } from './challenges/QuizChallenge.js';
import { MultipleChoiceQuestion } from './challenges/questions/MultipleChoiceQuestion.js';
import { CalculationQuestion } from './challenges/questions/CalculationQuestion.js';
import { ClockQuestion } from './challenges/questions/ClockQuestion.js';
import { SpellingQuestion } from './challenges/questions/SpellingQuestion.js';

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
    
    // Load teleporter sprites
    this.load.image('teleporter', 'sprites/Base pack/Items/switchMid.png');
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
    
    // Use FirstLevel for level 1, RandomLevelBuilder for subsequent levels
    if (this.currentLevel === 1) {
      this.levelBuilder = new FirstLevel(this);
    } else {
      this.levelBuilder = new RandomLevelBuilder(this);
    }
    
    this.levelBuilder.generateGeometry(this.levelGeometry);
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;
    this.teleporters = levelObjects.teleporters || [];

    // Challenge state
    this.challengeActive = false;
    this.challengeDoors = [];

    // Create challenge doors
    this.createChallengeDoors();

    // Create player character (alien sprite)
    const startPos = this.levelGeometry.getPlayerStartPosition();
    this.player = this.physics.add.sprite(startPos.x, startPos.y, 'alienStand');
    this.player.body.setGravityY(800);
    this.player.setScale(0.8); // Adjust size if needed

    // Create animations for the player (only if they don't exist yet)
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: [
          { key: 'alienWalk1' },
          { key: 'alienWalk2' }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: [{ key: 'alienStand' }],
        frameRate: 10
      });
    }

    if (!this.anims.exists('jump')) {
      this.anims.create({
        key: 'jump',
        frames: [{ key: 'alienJump' }],
        frameRate: 10
      });
    }

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
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nGebruik de knoppen om te spelen`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
      this.text.setScrollFactor(0); // Keep text fixed to camera
    } else {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nPijltjestoetsen om te bewegen, Spatiebalk om te springen`, {
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
      jump: false,
      jumpRequested: false  // Persists until jump is executed
    };

    // Track active pointers for each button to handle multi-touch properly
    this.activePointers = {
      left: new Set(),
      right: new Set(),
      jump: new Set()
    };

    // Track if space was pressed (for edge-triggered jump)
    this.spaceWasPressed = false;

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
    if (this.teleporters) {
      this.teleporters.forEach(t => t.destroy());
      this.teleporters = [];
    }
    if (this.challengeDoors) {
      this.challengeDoors.forEach(cd => cd.destroy());
      this.challengeDoors = [];
    }
    
    // Regenerate level - use RandomLevelBuilder for level 2+
    this.levelGeometry = new LevelGeometry();
    this.levelBuilder = new RandomLevelBuilder(this);
    this.levelBuilder.generateGeometry(this.levelGeometry);
    const levelObjects = this.levelBuilder.build(this.levelGeometry);
    this.platforms = levelObjects.platforms;
    this.door = levelObjects.door;
    this.teleporters = levelObjects.teleporters || [];

    // Create challenge doors for new level
    this.createChallengeDoors();
    
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
    // Skip player control when challenge is active
    if (this.challengeActive) {
      return;
    }

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

    // Handle keyboard jump - track edge trigger manually for reliability
    const spaceIsDown = this.spaceKey.isDown;
    const spaceJustPressed = spaceIsDown && !this.spaceWasPressed;
    this.spaceWasPressed = spaceIsDown;

    // Request jump on button press (will be consumed when grounded)
    if (spaceJustPressed || this.mobileControls.jumpRequested) {
      if (this.player.body.touching.down) {
        // Execute jump
        this.player.body.setVelocityY(this.jumpVelocity);
        this.player.anims.play('jump', true);
        this.mobileControls.jumpRequested = false;  // Consume the request
      }
      // If not grounded, jumpRequested stays true until we land and jump
    }

    // Clear jump request if button/key released while still in air
    if (!spaceIsDown && !this.mobileControls.jump) {
      this.mobileControls.jumpRequested = false;
    }

    // Play jump animation when in air
    if (!this.player.body.touching.down && this.player.anims.currentAnim?.key !== 'jump') {
      this.player.anims.play('jump', true);
    }

    // Check for door collision
    if (this.door && this.physics.overlap(this.player, this.door)) {
      this.nextLevel();
    }

    // Check for challenge door collision
    for (const challengeDoor of this.challengeDoors) {
      if (challengeDoor.checkOverlap(this.player)) {
        break;  // Only one challenge at a time
      }
    }

    // Check for teleporter collision - one-way only from 'from' to 'to'
    if (this.teleporters && this.teleporters.length >= 2) {
      const fromTeleporter = this.teleporters.find(t => t.teleporterType === 'from');
      const toTeleporter = this.teleporters.find(t => t.teleporterType === 'to');
      
      if (fromTeleporter && toTeleporter && this.physics.overlap(this.player, fromTeleporter)) {
        if (!this.teleportCooldown) {
          this.player.x = toTeleporter.x;
          this.player.y = toTeleporter.y - 50;
          this.player.body.setVelocity(0, 0);
          this.teleportCooldown = true;
          this.time.delayedCall(1000, () => { this.teleportCooldown = false; });
        }
      }
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

  /**
   * Maakt challenge deuren aan op basis van level geometry
   */
  createChallengeDoors() {
    const challengeDoorData = this.levelGeometry.getChallengeDoors();
    
    for (const doorData of challengeDoorData) {
      let challenge;
      
      if (doorData.challengeType === 'quiz') {
        // Maak Question objecten van de data
        const questions = doorData.challengeData.questions.map(qData => {
          switch (qData.type) {
            case 'multipleChoice':
              return new MultipleChoiceQuestion({
                question: qData.question,
                options: qData.options,
                correctIndex: qData.correctIndex
              });
            case 'calculation':
              return new CalculationQuestion({
                question: qData.question,
                answer: qData.answer
              });
            case 'clock':
              return new ClockQuestion({
                hours: qData.hours,
                minutes: qData.minutes
              });
            case 'spelling':
              return new SpellingQuestion({
                image: qData.image,
                answer: qData.answer,
                hint: qData.hint
              });
            default:
              console.warn(`Onbekend vraagtype: ${qData.type}`);
              return null;
          }
        }).filter(q => q !== null);

        challenge = new QuizChallenge(this, questions);
      }
      
      if (challenge) {
        const challengeDoor = new ChallengeDoor(this, doorData.x, doorData.y, challenge);
        challengeDoor.create();
        this.challengeDoors.push(challengeDoor);
      }
    }
  }

  createMobileButtons() {
    const buttonSize = 120;
    const buttonMargin = 30;
    const gameHeight = this.scale.height;
    const gameWidth = this.scale.width;
    const buttonY = gameHeight - buttonMargin - buttonSize / 2;
    
    // Left button (lower left corner)
    const leftButtonX = buttonMargin + buttonSize / 2;
    this.leftButton = this.add.rectangle(leftButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.leftButton.setScrollFactor(0);
    this.leftButton.setInteractive();
    this.leftButton.setDepth(100);
    
    const leftText = this.add.text(leftButtonX, buttonY, '←', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    leftText.setScrollFactor(0);
    leftText.setDepth(101);

    this.leftButton.on('pointerdown', (pointer) => {
      this.activePointers.left.add(pointer.id);
      this.mobileControls.left = true;
      this.leftButton.setFillStyle(0x666666, 0.9);
    });
    this.leftButton.on('pointerup', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.leftButton.on('pointerout', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.leftButton.on('pointerupoutside', (pointer) => {
      this.activePointers.left.delete(pointer.id);
      if (this.activePointers.left.size === 0) {
        this.mobileControls.left = false;
        this.leftButton.setFillStyle(0x444444, 0.7);
      }
    });

    // Right button (lower left corner, next to left button)
    const rightButtonX = leftButtonX + buttonSize + 20;
    this.rightButton = this.add.rectangle(rightButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.rightButton.setScrollFactor(0);
    this.rightButton.setInteractive();
    this.rightButton.setDepth(100);
    
    const rightText = this.add.text(rightButtonX, buttonY, '→', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    rightText.setScrollFactor(0);
    rightText.setDepth(101);

    this.rightButton.on('pointerdown', (pointer) => {
      this.activePointers.right.add(pointer.id);
      this.mobileControls.right = true;
      this.rightButton.setFillStyle(0x666666, 0.9);
    });
    this.rightButton.on('pointerup', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.rightButton.on('pointerout', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.rightButton.on('pointerupoutside', (pointer) => {
      this.activePointers.right.delete(pointer.id);
      if (this.activePointers.right.size === 0) {
        this.mobileControls.right = false;
        this.rightButton.setFillStyle(0x444444, 0.7);
      }
    });

    // Jump button (lower right corner)
    const jumpButtonX = gameWidth - buttonMargin - buttonSize / 2;
    this.jumpButton = this.add.rectangle(jumpButtonX, buttonY, buttonSize, buttonSize, 0x444444, 0.7);
    this.jumpButton.setScrollFactor(0);
    this.jumpButton.setInteractive();
    this.jumpButton.setDepth(100);
    
    const jumpText = this.add.text(jumpButtonX, buttonY, '↑', {
      fontSize: '64px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    jumpText.setScrollFactor(0);
    jumpText.setDepth(101);

    this.jumpButton.on('pointerdown', (pointer) => {
      this.activePointers.jump.add(pointer.id);
      this.mobileControls.jump = true;
      this.mobileControls.jumpRequested = true;  // Request jump (persists until executed)
      this.jumpButton.setFillStyle(0x666666, 0.9);
    });
    this.jumpButton.on('pointerup', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.jumpButton.on('pointerout', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
    this.jumpButton.on('pointerupoutside', (pointer) => {
      this.activePointers.jump.delete(pointer.id);
      if (this.activePointers.jump.size === 0) {
        this.mobileControls.jump = false;
        this.jumpButton.setFillStyle(0x444444, 0.7);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
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
    width: 3200,
    height: 2400
  },
  input: {
    activePointers: 3 // Enable up to 3 simultaneous touch points
  }
};

const game = new Phaser.Game(config);
