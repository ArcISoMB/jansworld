export class LevelGeometry {
  constructor(worldWidth = 3200) {
    this.worldWidth = worldWidth;
    this.floorY = 2400;
    this.tileWidth = 70;
    this.doorX = 730;
    this.doorY = 50;
    this.doorPlatformY = 120;
    this.startX = 100;
    this.startY = 2340;
    this.platforms = [];
    this.floorTiles = [];
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
