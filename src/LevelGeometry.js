export class LevelGeometry {
  constructor(worldWidth = 3200) {
    this.worldWidth = worldWidth;
    this.floorY = 520;
    this.tileWidth = 70;
    this.doorX = 730;
    this.doorY = 50;
    this.doorPlatformY = 120;
    this.startX = 100;
    this.startY = 440;
    this.platforms = [];
    this.floorTiles = [];
  }

  generate() {
    // Generate floor tiles - span the entire world width
    this.floorTiles = [];
    for (let x = 0; x < this.worldWidth; x += this.tileWidth) {
      this.floorTiles.push({
        x: x + this.tileWidth / 2,
        y: this.floorY
      });
    }

    // Platform generation parameters
    const maxJumpDistanceX = 200;
    const maxJumpDistanceY = 150;
    const maxFallDistance = 300;
    const minVerticalGap = 100;
    const minHorizontalGap = 120;
    
    const numPlatforms = 5 + Math.floor(Math.random() * 2);
    this.platforms = [];
    
    let currentX = this.startX;
    let currentY = this.floorY;
    
    const targetX = this.doorX - 50;
    const targetY = this.doorPlatformY;
    
    for (let i = 0; i < numPlatforms; i++) {
      const nextX = currentX + (targetX - currentX) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 60;
      const nextY = currentY - (currentY - targetY) * (1 / (numPlatforms - i)) + (Math.random() - 0.5) * 40;
      
      const clampedX = Math.max(currentX - maxJumpDistanceX, Math.min(currentX + maxJumpDistanceX, nextX));
      const clampedY = Math.max(targetY, Math.min(currentY + maxFallDistance, nextY));
      
      let finalY = Math.max(clampedY, currentY - maxJumpDistanceY);
      
      if (finalY < this.doorPlatformY) {
        finalY = this.doorPlatformY;
      }
      
      if (Math.abs(finalY - currentY) < minVerticalGap && finalY < currentY) {
        finalY = currentY - minVerticalGap;
        if (finalY < this.doorPlatformY) {
          finalY = this.doorPlatformY;
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
      this.platforms.push({ x: finalX, y: finalY, width: width });
      currentX = finalX;
      currentY = finalY;
    }
    
    // Add final platform near door
    this.platforms.push({ x: 715, y: 120, width: 140 });
  }

  getPlayerStartPosition() {
    return { x: this.startX, y: this.startY };
  }

  getDoorPosition() {
    return { x: this.doorX, y: this.doorY };
  }

  getFloorTiles() {
    return this.floorTiles;
  }

  getPlatforms() {
    return this.platforms;
  }
}
