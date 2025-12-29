import { LevelBuilder } from './LevelBuilder.js';

/**
 * First level with hard-coded geometry
 */
export class FirstLevel extends LevelBuilder {
  /**
   * Generates hard-coded geometry for the first level
   * @param {LevelGeometry} levelGeometry - The level geometry object to populate
   */
  generateGeometry(levelGeometry) {
    // Floor tiles
    levelGeometry.floorTiles = [];
    for (let x = 0; x < levelGeometry.worldWidth; x += levelGeometry.tileWidth) {
      levelGeometry.floorTiles.push({
        x: x + levelGeometry.tileWidth / 2,
        y: levelGeometry.floorY
      });
    }

    // Hard-coded platforms for first level
    // Create a simple, learnable path to the exit
    levelGeometry.platforms = [
      // Starting platform
      { x: 300, y: 300, width: 500 },
      
      // Jump to middle platform
      { x: 500, y: 0, width: 120 },
      
      // Higher platform
      { x: 650, y: 240, width: 100 },
      
      // Platform near door
      { x: 715, y: 120, width: 140 }
    ];

    // Set player start position (on the ground initially)
    levelGeometry.startX = 100;
    levelGeometry.startY = 2300;

    // Set door position
    levelGeometry.doorX = 730;
    levelGeometry.doorY = 50;
    levelGeometry.doorPlatformY = 120;
  }
}
