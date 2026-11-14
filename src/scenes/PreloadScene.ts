import Phaser from 'phaser'
import {
  buildMoonGroundTexture,
  generateBaseTexture,
  generateRoverTexture,
  generateDustParticleTexture,
} from '../utils/textureGenerators'
import { useGameStore } from '../store/gameStore'

export default class PreloadScene extends Phaser.Scene {
  private progressBarGfx!: Phaser.GameObjects.Graphics
  private progressBoxGfx!: Phaser.GameObjects.Graphics
  private statusText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text
  private tipText!: Phaser.GameObjects.Text

  constructor() {
    super('PreloadScene')
  }

  preload() {
    const { width, height } = this.scale

    // ── Kid-friendly loading UI ──
    const cx = width / 2
    const cy = height / 2

    // Title
    this.add
      .text(cx, cy - 65, '🚀 Preparing your base...', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: '#38bdf8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // Progress Bar Background
    const barW = Math.min(320, width - 48)
    const barH = 14
    const barX = cx - barW / 2
    const barY = cy - 20

    this.progressBoxGfx = this.add.graphics()
    this.progressBoxGfx.fillStyle(0x0f172a, 0.8)
    this.progressBoxGfx.fillRoundedRect(barX, barY, barW, barH, 7)
    this.progressBoxGfx.lineStyle(1.5, 0x38bdf8, 0.4)
    this.progressBoxGfx.strokeRoundedRect(barX, barY, barW, barH, 7)

    this.progressBarGfx = this.add.graphics()

    // Percentage
    this.percentText = this.add
      .text(cx, cy + 10, '0%', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)

    // Status description
    this.statusText = this.add
      .text(cx, cy + 34, 'Downloading mission equipment...', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)

    // Cute rotating tip
    const tips = [
      'Tip: Stay close to base to recharge your battery!',
      'Tip: Watch the sun — return before sunset storms!',
      'Tip: Solar panels charge faster at midday!',
      'Tip: Scan shiny rocks to earn science discoveries!',
    ]
    this.tipText = this.add
      .text(cx, cy + 68, tips[Math.floor(Math.random() * tips.length)], {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: '#64748b',
        align: 'center',
      })
      .setOrigin(0.5)

    // Preload Day 1 Tiles & Sprites
    for (const n of [41, 42]) {
      const pad = String(n).padStart(2, '0')
      this.load.image(`tile${pad}`, `/assets/kenney/scifiTile_${pad}.png`)
    }

    for (let i = 1; i <= 8; i++) {
      const pad = String(i).padStart(2, '0')
      this.load.image(`env${pad}`, `/assets/kenney/scifiEnvironment_${pad}.png`)
    }

    this.load.image('base', '/assets/kenney/scifiStructure_14.png')
    this.load.image('rover', '/assets/kenney/scifiUnit_01.png')

    // File download progress (0% to 60%)
    this.load.on('progress', (value: number) => {
      const pct = Math.round(value * 60)
      this.updateProgress(pct, barX + 2, barY + 2, barW - 4, barH - 4)
    })

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('Asset failed to load:', file.key)
    })
  }

  create() {
    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2
    const barW = Math.min(320, width - 48)
    const barH = 14
    const barX = cx - barW / 2
    const barY = cy - 20

    const isMoon = useGameStore.getState().planet === 'moon'

    // Decode loaded images to prevent first-render jank
    this.statusText.setText('Decoding visual assets...')
    this.updateProgress(70, barX + 2, barY + 2, barW - 4, barH - 4)

    // ── Progressive texture generation spread across rAF frames ──
    requestAnimationFrame(() => {
      // Frame 1: Ground texture
      this.statusText.setText('Surveying planetary surface...')
      this.updateProgress(80, barX + 2, barY + 2, barW - 4, barH - 4)
      if (isMoon) {
        buildMoonGroundTexture(this.textures)
      }

      requestAnimationFrame(() => {
        // Frame 2: Outpost Base
        this.statusText.setText('Constructing habitat dome & solar arrays...')
        this.updateProgress(90, barX + 2, barY + 2, barW - 4, barH - 4)
        generateBaseTexture(this.textures, isMoon)

        requestAnimationFrame(() => {
          // Frame 3: Rover & Particles
          this.statusText.setText('Powering up rover telemetry...')
          this.updateProgress(95, barX + 2, barY + 2, barW - 4, barH - 4)
          generateRoverTexture(this.textures)
          generateDustParticleTexture(this.textures)

          requestAnimationFrame(() => {
            // Frame 4: GPU Pipeline Warm-up
            this.statusText.setText('Systems ready!')
            this.updateProgress(100, barX + 2, barY + 2, barW - 4, barH - 4)

            // Warm up: draw 1 frame with alpha 0.01 to compile WebGL shaders
            const warmContainer = this.add.container(-1000, -1000)
            const b = this.add.image(0, 0, isMoon ? 'outpost_base_moon' : 'outpost_base_mars').setAlpha(0.01)
            const r = this.add.image(0, 0, 'pro_rover').setAlpha(0.01)
            warmContainer.add([b, r])

            setTimeout(() => {
              warmContainer.destroy()
              this.scene.start('MarsScene')
            }, 80)
          })
        })
      })
    })
  }

  private updateProgress(pct: number, x: number, y: number, maxW: number, h: number) {
    if (!this.progressBarGfx || !this.percentText) return
    this.percentText.setText(`${pct}%`)
    this.progressBarGfx.clear()
    const fillW = Math.max(0, (maxW * pct) / 100)
    this.progressBarGfx.fillStyle(0x38bdf8, 1)
    this.progressBarGfx.fillRoundedRect(x, y, fillW, h, 5)
  }
}
