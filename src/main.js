import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.currentLevel = 1;
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

    // Generate level
    this.generateLevel();

    // Create player character (blue block)
    this.player = this.add.rectangle(100, 440, 32, 48, 0x0066ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

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

    // Create floor - full width at bottom (higher up to leave space for buttons)
    const floor = this.add.rectangle(400, 520, 800, 40, 0x4a4a4a);
    this.platforms.add(floor);

    // Generate random platforms that create a path to the door
    // Door is in upper right corner at approximately (730, 80)
    const doorX = 730;
    const doorY = 80;

    // Create platforms with guaranteed reachability
    // We'll create platforms in segments from bottom to top
    const numPlatforms = 4 + Math.floor(Math.random() * 3); // 4-6 platforms
    
    for (let i = 0; i < numPlatforms; i++) {
      // Calculate Y position - platforms go from bottom to top
      const minY = 150 + (i * 50);
      const maxY = 450 - (i * 30);
      const y = Math.random() * (maxY - minY) + minY;
      
      // Calculate X position - bias towards right side for higher platforms
      const minX = 100;
      const maxX = 700;
      const bias = i / numPlatforms; // 0 to 1
      const x = Math.random() * (maxX - minX) * (1 - bias * 0.3) + minX + (bias * 150);
      
      const width = 80 + Math.random() * 100; // 80-180 width
      const platform = this.add.rectangle(x, y, width, 20, 0x6b8e23);
      this.platforms.add(platform);
    }

    // Add a final platform near the door to ensure it's reachable
    const finalPlatform = this.add.rectangle(680, 120, 120, 20, 0x6b8e23);
    this.platforms.add(finalPlatform);

    // Refresh the static group
    this.platforms.refresh();

    // Create the door in upper right corner
    this.door = this.add.rectangle(doorX, doorY, 40, 60, 0xffd700); // Gold door
    this.physics.add.existing(this.door);
    this.door.body.setAllowGravity(false);
    this.door.body.setImmovable(true);

    // Add door label
    this.add.text(doorX, doorY - 40, 'EXIT', {
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
    this.leftButton.on('pointerout', () => {
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
    this.rightButton.on('pointerout', () => {
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
    this.jumpButton.on('pointerout', () => {
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
