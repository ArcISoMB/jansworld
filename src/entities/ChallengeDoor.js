/**
 * Een deur die leidt naar een uitdaging
 */
export class ChallengeDoor {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - X positie
   * @param {number} y - Y positie
   * @param {Challenge} challenge - De uitdaging achter deze deur
   */
  constructor(scene, x, y, challenge) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.challenge = challenge;
    this.isUsed = false;
    this.sprite = null;
    this.topSprite = null;
    this.label = null;
    this.playerWasOverlapping = false;  // Track of speler al overlapped
  }

  create() {
    // Maak deur sprite (getint om verschil te tonen met exit deur)
    this.topSprite = this.scene.physics.add.sprite(this.x, this.y - 35, 'doorTop');
    this.topSprite.body.setAllowGravity(false);
    this.topSprite.body.setImmovable(true);
    this.topSprite.setTint(0x44aaff);  // Blauwe tint voor challenge deur
    
    this.sprite = this.scene.physics.add.sprite(this.x, this.y + 35, 'doorClosed');
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setImmovable(true);
    this.sprite.setTint(0x44aaff);  // Blauwe tint voor challenge deur

    // Label
    this.label = this.scene.add.text(this.x, this.y + 90, '⭐ QUIZ', {
      fontSize: '16px',
      fill: '#44aaff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Indicator of challenge al voltooid is
    this.updateVisuals();

    return this;
  }

  /**
   * Update visuele status (voltooid/niet voltooid)
   */
  updateVisuals() {
    if (this.challenge.isCompleted) {
      // Verberg de deur maar toon een symbool
      this.hideDoor();
      this.showCompletionSymbol();
    }
  }

  /**
   * Verberg alleen de deur sprites
   */
  hideDoor() {
    if (this.sprite) this.sprite.setVisible(false);
    if (this.topSprite) this.topSprite.setVisible(false);
    if (this.label) this.label.setVisible(false);
    // Disable physics body zodat er geen collision meer is
    if (this.sprite && this.sprite.body) this.sprite.body.enable = false;
    if (this.topSprite && this.topSprite.body) this.topSprite.body.enable = false;
  }

  /**
   * Toon voltooiingssymbool op de plek van de deur
   */
  showCompletionSymbol() {
    if (!this.completionSymbol) {
      this.completionSymbol = this.scene.add.text(this.x, this.y, '🎉', {
        fontSize: '64px'
      }).setOrigin(0.5).setDepth(10);
    }
  }

  /**
   * Check of speler overlapped en start uitdaging indien nodig
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @returns {boolean} true als uitdaging is gestart
   */
  checkOverlap(player) {
    // Check of challenge net voltooid is en update visuals
    if (this.challenge.isCompleted && !this.completionSymbol) {
      this.updateVisuals();
    }

    // Skip als challenge actief of voltooid is
    if (this.challenge.isActive || this.challenge.isCompleted) {
      return false;
    }

    const overlaps = this.scene.physics.overlap(player, this.sprite);
    
    if (overlaps) {
      // Alleen starten als speler NIET al overlappend was (moet eerst weglopen)
      if (!this.playerWasOverlapping) {
        this.playerWasOverlapping = true;
        this.challenge.start();
        return true;
      }
    } else {
      // Speler is weggelopen, reset de flag
      this.playerWasOverlapping = false;
    }
    
    return false;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.topSprite) this.topSprite.destroy();
    if (this.label) this.label.destroy();
    if (this.completionSymbol) this.completionSymbol.destroy();
    if (this.challenge) this.challenge.destroy();
  }
}
