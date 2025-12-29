import { LevelBuilder } from './LevelBuilder.js';

/**
 * Random level builder that generates procedural levels
 */
export class RandomLevelBuilder extends LevelBuilder {
  /**
   * Generates random level geometry
   * @param {LevelGeometry} levelGeometry - The level geometry object to populate
   */
  generateGeometry(levelGeometry) {
    // Generate floor tiles - span the entire world width
    levelGeometry.floorTiles = [];
    for (let x = 0; x < levelGeometry.worldWidth; x += levelGeometry.tileWidth) {
      levelGeometry.floorTiles.push({
        x: x + levelGeometry.tileWidth / 2,
        y: levelGeometry.floorY
      });
    }

    // Platform generation parameters
    const maxJumpDistanceX = 200;
    const maxJumpDistanceY = 150;
    const maxFallDistance = 300;
    const minVerticalGap = 100;
    const minHorizontalGap = 120;
    
    const numPlatforms = 5 + Math.floor(Math.random() * 2);
    levelGeometry.platforms = [];
    
    let currentX = levelGeometry.startX;
    let currentY = levelGeometry.floorY;
    
    const targetX = levelGeometry.doorX - 50;
    const targetY = levelGeometry.doorPlatformY;
    
    for (let i = 0; i < numPlatforms; i++) {
      const nextX = currentX + (targetX - currentX) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 60;
      const nextY = currentY - (currentY - targetY) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 40;
      
      const clampedX = Math.max(currentX - maxJumpDistanceX, Math.min(currentX + maxJumpDistanceX, nextX));
      const clampedY = Math.max(targetY, Math.min(currentY + maxFallDistance, nextY));
      
      let finalY = Math.max(clampedY, currentY - maxJumpDistanceY);
      
      if (finalY < levelGeometry.doorPlatformY) {
        finalY = levelGeometry.doorPlatformY;
      }
      
      if (Math.abs(finalY - currentY) < minVerticalGap && finalY < currentY) {
        finalY = currentY - minVerticalGap;
        if (finalY < levelGeometry.doorPlatformY) {
          finalY = levelGeometry.doorPlatformY;
        }
      }
      
      let finalX = clampedX;
      const horizontalDistance = Math.abs(finalX - currentX);
      if (horizontalDistance < minHorizontalGap && horizontalDistance > 10) {
        if (finalX > currentX) {
          finalX = currentX + minHorizontalGap;
        } else {
          finalX = currentX - minHorizontalGap;
        }
      }
      
      const width = 100 + Math.random() * 80;
      levelGeometry.platforms.push({ x: finalX, y: finalY, width: width });
      currentX = finalX;
      currentY = finalY;
    }
    
    // Add final platform near door
    levelGeometry.platforms.push({ x: 715, y: 120, width: 140 });
  }
}
