import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene') }

  preload() {
    // Load ground tiles (use first 8 for Mars ground variation)
    for (let i = 1; i <= 8; i++) {
      const key = `tile${String(i).padStart(2,'0')}`
      this.load.image(key, `/assets/kenney/scifiTile_${String(i).padStart(2,'0')}.png`)
    }
    // Environment objects (rocks)
    for (let i = 1; i <= 10; i++) {
      this.load.image(
        `env${String(i).padStart(2,'0')}`,
        `/assets/kenney/scifiEnvironment_${String(i).padStart(2,'0')}.png`
      )
    }
    // Base structure
    this.load.image('base', '/assets/kenney/scifiStructure_14.png')
    // Rover unit
    this.load.image('rover', '/assets/kenney/scifiUnit_01.png')

    // Fallback: if images fail, we draw with shapes in MarsScene
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('Asset failed to load:', file.key)
    })
  }

  create() {
    this.scene.start('MarsScene')
  }
}
