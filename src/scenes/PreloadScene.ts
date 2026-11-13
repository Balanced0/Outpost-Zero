import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene') }

  preload() {
    // ---- GROUND TILES ----
    // Only load the two plain solid ground tiles (41 & 42).
    // All other tiles (01-40) contain path stripes, blue water, plants, or cliffs — excluded.
    for (const n of [41, 42]) {
      const pad = String(n).padStart(2, '0')
      this.load.image(`tile${pad}`, `/assets/kenney/scifiTile_${pad}.png`)
    }

    // ---- ENVIRONMENT ROCKS ----
    // env01 = orange rock cluster  (Mars rocks, warm)
    // env02 = brown rock cluster   (Mars rocks, warm)
    // env03 = small gray rock      (Moon rocks, gray)
    // env04 = medium gray crystal  (Moon rocks, gray)
    // env05 = gray rock pair       (Moon rocks, gray)
    // env06 = gray cluster small   (Moon rocks, gray)
    // env07 = gray cluster med     (Moon rocks, gray)
    // env08 = gray cluster + stars (Moon, slightly blue-ish, acceptable)
    // env09-14 = GREEN PLANTS / PURPLE PLANTS — intentionally NOT loaded
    for (let i = 1; i <= 8; i++) {
      const pad = String(i).padStart(2, '0')
      this.load.image(`env${pad}`, `/assets/kenney/scifiEnvironment_${pad}.png`)
    }

    // ---- BASE STRUCTURE ----
    this.load.image('base', '/assets/kenney/scifiStructure_14.png')

    // ---- ROVER UNIT ----
    this.load.image('rover', '/assets/kenney/scifiUnit_01.png')

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('Asset failed to load:', file.key)
    })
  }

  create() {
    this.scene.start('MarsScene')
  }
}
