/**
 * Abstract base class for level builders
 */
export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Builds the level and returns game objects
   * @param {LevelGeometry} levelGeometry - The level geometry data
   * @returns {Object} Object containing platforms and door references
   */
  build(levelGeometry) {
    // Create platforms group (static physics bodies)
    const platforms = this.scene.physics.add.staticGroup();

    // Create floor tiles
    const floorTiles = levelGeometry.getFloorTiles();
    floorTiles.forEach(tile => {
      const floorTile = platforms.create(tile.x, tile.y, 'floor');
      floorTile.setScale(1).refreshBody();
    });

    // Create platform tiles
    const platformData = levelGeometry.getPlatforms();
    platformData.forEach(platform => {
      const numTiles = Math.floor(platform.width / 70);
      for (let t = 0; t < numTiles; t++) {
        const tileX = platform.x - (numTiles * 35) + (t * 70) + 35;
        const tile = platforms.create(tileX, platform.y, 'platform');
        tile.setScale(1).refreshBody();
      }
    });

    // Refresh the static group
    platforms.refresh();

    // Create the door
    const doorPos = levelGeometry.getDoorPosition();
    const doorTop = this.scene.physics.add.sprite(doorPos.x, doorPos.y - 35, 'doorTop');
    doorTop.body.setAllowGravity(false);
    doorTop.body.setImmovable(true);
    
    const doorBottom = this.scene.physics.add.sprite(doorPos.x, doorPos.y, 'doorClosed');
    doorBottom.body.setAllowGravity(false);
    doorBottom.body.setImmovable(true);

    // Add door label
    this.scene.add.text(doorPos.x, doorPos.y + 50, 'EXIT', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    return {
      platforms: platforms,
      door: doorTop
    };
  }

  /**
   * Abstract method to be implemented by subclasses
   * Generates or defines the level geometry
   * @param {LevelGeometry} levelGeometry - The level geometry object to populate
   */
  generateGeometry(levelGeometry) {
    throw new Error('generateGeometry() must be implemented by subclass');
  }
}
