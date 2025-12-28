import Phaser from 'phaser';

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
    this.generateLevel();

    // Create player character (alien sprite)
    this.player = this.physics.add.sprite(100, 440, 'alienStand');
    this.player.setCollideWorldBounds(true);
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

    // Add level counter and instructional text
    if (this.isMobile) {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nUse buttons to play`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
    } else {
      this.text = this.add.text(10, 10, `Level ${this.currentLevel}\nArrow keys to move, Space to jump`, {
        fontSize: '24px',
        fill: '#ffffff'
      });
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

  generateLevel() {
    // Create platforms group (static physics bodies)
    this.platforms = this.physics.add.staticGroup();

    // Create floor - use multiple tiles
    const floorY = 520;
    const tileWidth = 70; // Approximate width of grass tile
    for (let x = 0; x < 800; x += tileWidth) {
      const tile = this.platforms.create(x + tileWidth/2, floorY, 'floor');
      tile.setScale(1).refreshBody();
    }

    // Generate random platforms that create a path to the door
    // Door is in upper right corner at approximately (730, 50)
    const doorX = 730;
    const doorY = 50;

    // Create a guaranteed path of platforms from start to door
    // Each platform must be within jumping distance (horizontally and vertically)
    const maxJumpDistanceX = 200; // Maximum horizontal jump distance
    const maxJumpDistanceY = 150; // Maximum vertical jump distance (up)
    const maxFallDistance = 300; // Can fall down any distance
    const minVerticalGap = 100; // Minimum vertical gap to prevent getting stuck
    const minHorizontalGap = 120; // Minimum horizontal gap between platforms
    
    const numPlatforms = 5 + Math.floor(Math.random() * 2); // 5-6 platforms
    const platforms = [];
    
    // Starting position (player starts at x=100, on floor at y=520)
    let currentX = 100;
    let currentY = floorY;
    
    // Target is the door area
    const targetX = doorX - 50; // Platform should be slightly left of door
    const targetY = 120; // Final platform height
    
    for (let i = 0; i < numPlatforms; i++) {
      // Calculate progress towards target (0 to 1)
      const progress = (i + 1) / numPlatforms;
      
      // Move towards target, ensuring each step is reachable
      const nextX = currentX + (targetX - currentX) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 60;
      const nextY = currentY - (currentY - targetY) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 40;
      
      // Clamp to ensure reachability
      const clampedX = Math.max(currentX - maxJumpDistanceX, Math.min(currentX + maxJumpDistanceX, nextX));
      const clampedY = Math.max(targetY, Math.min(currentY + maxFallDistance, nextY));
      
      // Ensure Y goes upward mostly (can't jump too high in one step)
      let finalY = Math.max(clampedY, currentY - maxJumpDistanceY);
      
      // IMPORTANT: Ensure minimum vertical gap to prevent getting stuck
      // If platform is too close vertically, push it further away
      if (Math.abs(finalY - currentY) < minVerticalGap && finalY < currentY) {
        finalY = currentY - minVerticalGap;
      }
      
      // Ensure minimum horizontal gap between platforms (or make them overlap/far apart)
      let finalX = clampedX;
      const horizontalDistance = Math.abs(finalX - currentX);
      if (horizontalDistance < minHorizontalGap && horizontalDistance > 10) {
        // Either push it further away or move it closer (to overlap/be far)
        if (finalX > currentX) {
          finalX = currentX + minHorizontalGap;
        } else {
          finalX = currentX - minHorizontalGap;
        }
      }
      
      platforms.push({ x: finalX, y: finalY });
      currentX = finalX;
      currentY = finalY;
    }
    
    // Create platform tiles for each platform in the path
    platforms.forEach(platform => {
      const width = 100 + Math.random() * 80; // 100-180 width
      const numTiles = Math.floor(width / 70);
      
      for (let t = 0; t < numTiles; t++) {
        const tileX = platform.x - (numTiles * 35) + (t * 70) + 35;
        const tile = this.platforms.create(tileX, platform.y, 'platform');
        tile.setScale(1).refreshBody();
      }
    });

    // Add a final platform directly below/near the door to ensure it's reachable
    for (let t = 0; t < 2; t++) {
      const tile = this.platforms.create(680 + (t * 70), 120, 'platform');
      tile.setScale(1).refreshBody();
    }

    // Refresh the static group
    this.platforms.refresh();

    // Create the door in upper right corner
    this.door = this.physics.add.sprite(doorX, doorY - 35, 'doorTop');
    this.door.body.setAllowGravity(false);
    this.door.body.setImmovable(true);
    
    const doorBottom = this.physics.add.sprite(doorX, doorY, 'doorClosed');
    doorBottom.body.setAllowGravity(false);
    doorBottom.body.setImmovable(true);

    // Add door label
    this.add.text(doorX, doorY + 50, 'EXIT', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
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
    this.generateLevel();
    
    // Reset player position
    this.player.x = 100;
    this.player.y = 440;
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
  }
};

const game = new Phaser.Game(config);
