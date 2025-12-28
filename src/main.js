import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // No assets to load for minimal example
  }

  create() {
    // Create a simple red rectangle sprite
    this.sprite = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      32,
      32,
      0xff0000
    );

    // Add instructional text
    this.text = this.add.text(10, 10, 'Use arrow keys or touch to move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // Setup keyboard controls
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });

    this.speed = 5;

    // Enable touch/pointer input for mobile
  update() {
    // Handle continuous key input for smooth movement
    if (this.keys.right.isDown) {
      this.sprite.x += this.speed;
    }
    if (this.keys.left.isDown) {
      this.sprite.x -= this.speed;
    }
    if (this.keys.up.isDown) {
      this.sprite.y -= this.speed;
    }
    if (this.keys.down.isDown) {
      this.sprite.y += this.speed;
    }

    // Handle touch/pointer movement
    if (this.isMoving) {
      const dx = this.targetX - this.sprite.x;
      const dy = this.targetY - this.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.sprite.x += (dx / distance) * this.speed;
        this.sprite.y += (dy / distance) * this.speed;
      }
    }
  }   this.isMoving = false;
    });

    this.isMoving = false;
  }

  update() {
    // Handle continuous key input for smooth movement
    if (this.keys.right.isDown) {
      this.sprite.x += this.speed;
    }
    if (this.keys.left.isDown) {
      this.sprite.x -= this.speed;
    }
    if (this.keys.up.isDown) {
      this.sprite.y -= this.speed;
    }
    if (this.keys.down.isDown) {
      this.sprite.y += this.speed;
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
