import { Challenge } from './Challenge.js';

/**
 * Assignment uitdaging - een sub-level dat voltooid moet worden
 * (Placeholder voor toekomstige implementatie)
 */
export class AssignmentChallenge extends Challenge {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} levelData - Data voor het sub-level
   */
  constructor(scene, levelData) {
    super(scene, 'assignment');
    this.levelData = levelData;
    this.originalPlayerPosition = null;
  }

  start() {
    super.start();
    
    // Bewaar originele speler positie
    this.originalPlayerPosition = {
      x: this.scene.player.x,
      y: this.scene.player.y
    };
    
    // TODO: Laad sub-level geometry
    console.log('Assignment challenge gestart - nog niet geïmplementeerd');
  }

  complete() {
    // Herstel speler naar originele positie
    if (this.originalPlayerPosition) {
      this.scene.player.x = this.originalPlayerPosition.x;
      this.scene.player.y = this.originalPlayerPosition.y;
    }
    
    super.complete();
  }

  onComplete() {
    console.log('Assignment voltooid!');
  }

  onFail() {
    // Herstel speler naar originele positie
    if (this.originalPlayerPosition) {
      this.scene.player.x = this.originalPlayerPosition.x;
      this.scene.player.y = this.originalPlayerPosition.y;
    }
    
    console.log('Assignment gefaald!');
  }
}
