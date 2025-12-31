/**
 * Abstracte base class voor alle uitdagingen
 */
export class Challenge {
  constructor(scene, type) {
    this.scene = scene;
    this.type = type;  // 'quiz' of 'assignment'
    this.isActive = false;
    this.isCompleted = false;
    this.savedPlayerState = null;
    this.onCompleteCallback = null;  // Callback voor wanneer challenge voltooid wordt
  }

  /**
   * Start de uitdaging
   */
  start() {
    this.isActive = true;
    this.scene.challengeActive = true;
    
    // Sla speler positie en status op
    this.savedPlayerState = {
      x: this.scene.player.x,
      y: this.scene.player.y,
      velocityX: this.scene.player.body.velocity.x,
      velocityY: this.scene.player.body.velocity.y
    };
    
    // Stop de speler volledig
    this.scene.player.body.setVelocity(0, 0);
    this.scene.player.body.setAllowGravity(false);
    this.scene.player.anims.play('idle', true);
  }

  /**
   * Herstel speler na challenge
   */
  restorePlayer() {
    if (this.savedPlayerState) {
      this.scene.player.x = this.savedPlayerState.x;
      this.scene.player.y = this.savedPlayerState.y;
      this.scene.player.body.setVelocity(0, 0);
      this.scene.player.body.setAllowGravity(true);
      this.savedPlayerState = null;
    }
  }

  /**
   * Wordt aangeroepen wanneer de uitdaging succesvol is afgerond
   */
  complete() {
    this.isActive = false;
    this.isCompleted = true;
    this.scene.challengeActive = false;
    this.restorePlayer();
    
    // Roep callback aan voor de deur om visuals te updaten
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
    
    this.onComplete();
  }

  /**
   * Wordt aangeroepen wanneer de uitdaging gefaald is
   */
  fail() {
    this.isActive = false;
    this.scene.challengeActive = false;
    this.restorePlayer();
    this.onFail();
  }

  /**
   * Override in subclasses voor specifieke complete logica
   */
  onComplete() {
    console.log('Challenge voltooid!');
  }

  /**
   * Override in subclasses voor specifieke fail logica
   */
  onFail() {
    console.log('Challenge gefaald!');
  }

  /**
   * Update loop voor de uitdaging
   */
  update() {
    // Override in subclasses indien nodig
  }

  /**
   * Cleanup wanneer challenge wordt vernietigd
   */
  destroy() {
    this.isActive = false;
  }
}
