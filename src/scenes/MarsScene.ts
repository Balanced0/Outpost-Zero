import Phaser from 'phaser'
import { useGameStore } from '../store/gameStore'
import {
  BASE_X,
  BASE_Y,
  BASE_SAFE_DISTANCE,
  ROVER_SPEED,
  BATTERY_DRAIN_DRIVING,
  BATTERY_RECHARGE_BASE,
  SCAN_PROXIMITY_RADIUS,
} from '../config/gameConfig'
import { PLANETS } from '../config/planets'
import { DiscoverySpot } from '../data/discoverySpots'

const MAP_W = 4000
const MAP_H = 4000
const TILE_SIZE = 64
const MAP_SEED = 42

// Plain solid ground tiles only — no plants, no path stripes, no blue
// scifiTile_41 and scifiTile_42 are the only fully plain terracotta squares
const MARS_GROUND_TILES = ['tile41', 'tile42']

// Rock env sprites that are actual rocks (orange/brown for Mars, gray for Moon)
// env01 = orange rock cluster, env02 = brown rock cluster
// env03-07 = gray rock shapes (good for Moon or Mars with tint)
// env09-14 = plants/cacti — EXCLUDED
const MARS_ROCK_KEYS = ['env01', 'env02'] // warm rocky, orange-brown
const MOON_ROCK_KEYS = ['env03', 'env04', 'env05', 'env06', 'env07'] // naturally gray

export default class MarsScene extends Phaser.Scene {
  private rover!: Phaser.GameObjects.Image | Phaser.GameObjects.RenderTexture
  private roverBody!: Phaser.Physics.Arcade.Body
  private roverShadow!: Phaser.GameObjects.Ellipse
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }
  private spaceKey!: Phaser.Input.Keyboard.Key
  private rng!: Phaser.Math.RandomDataGenerator
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter

  // Ground & Visual Layers
  private groundRenderTexture!: Phaser.GameObjects.RenderTexture
  private cratersGraphics!: Phaser.GameObjects.Graphics
  private rockSprites: (Phaser.GameObjects.Image | Phaser.GameObjects.Graphics)[] = []

  // Stage 6 & 7A: Discoveries & Scanning Graphics
  private spotContainers: Map<string, Phaser.GameObjects.Container> = new Map()
  private scanGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('MarsScene')
  }

  create() {
    this.rng = new Phaser.Math.RandomDataGenerator([String(MAP_SEED)])

    const loader = this.textures
    const checkFailed = (key: string) =>
      !loader.exists(key) || loader.get(key).key === '__MISSING'

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H)

    // ---- 1. GROUND TILES (plain solid color only) ----
    this.buildGround(checkFailed)

    // ---- 2. CRATERS (soft, low-opacity shapes) ----
    this.drawCraters()

    // ---- 3. ROCKS (orange/brown for Mars; gray for Moon) ----
    this.scatterRocks(checkFailed)

    // ---- 4. BASE ----
    this.placeBase(checkFailed)

    // ---- 5. DISCOVERY SPOTS ----
    this.refreshDiscoverySpots()

    // ---- 6. ROVER SHADOW + ROVER ----
    this.createRover(checkFailed)

    // ---- 7. DUST PARTICLES ----
    this.createDustParticles()

    // ---- 8. SCAN GRAPHICS ----
    this.scanGraphics = this.add.graphics()
    this.scanGraphics.setDepth(16)

    // ---- 9. CAMERA ----
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)
    this.cameras.main.startFollow(
      this.rover as Phaser.GameObjects.GameObject,
      true,
      0.08,
      0.08,
    )

    // ---- 10. INPUT ----
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Event listeners
    const handleReset = () => {
      if (this.rover && this.roverBody) {
        this.rover.setPosition(BASE_X, BASE_Y)
        this.roverBody.reset(BASE_X, BASE_Y)
      }
      this.refreshDiscoverySpots()
    }
    window.addEventListener('reset-rover-to-base', handleReset)

    const handlePlanetChanged = () => {
      this.applyPlanetVisuals()
    }
    window.addEventListener('planet-changed', handlePlanetChanged)

    const handleCollected = (e: any) => {
      const id = e?.detail?.id
      if (!id) return
      const container = this.spotContainers.get(id)
      if (container) {
        this.tweens.add({
          targets: container,
          scaleX: 1.6,
          scaleY: 1.6,
          alpha: 0,
          duration: 350,
          ease: 'Sine.easeOut',
          onComplete: () => {
            container.destroy()
            this.spotContainers.delete(id)
          },
        })
      }
    }
    window.addEventListener('discovery-collected', handleCollected)

    this.events.once('shutdown', () => {
      window.removeEventListener('reset-rover-to-base', handleReset)
      window.removeEventListener('planet-changed', handlePlanetChanged)
      window.removeEventListener('discovery-collected', handleCollected)
    })
  }

  // ------------------------------------------------------------------ helpers

  private buildGround(checkFailed: (k: string) => boolean) {
    const cols = Math.ceil(MAP_W / TILE_SIZE)
    const rows = Math.ceil(MAP_H / TILE_SIZE)

    // Find which plain-ground tile keys actually loaded
    const availableTiles = MARS_GROUND_TILES.filter((k) => !checkFailed(k))

    // If no plain tiles loaded, fall back to solid color rectangle with variation
    if (availableTiles.length === 0) {
      this.buildGroundFallback()
      return
    }

    // Paint world using a single RenderTexture — plain tiles only
    this.groundRenderTexture = this.add.renderTexture(0, 0, MAP_W, MAP_H)
    this.groundRenderTexture.setOrigin(0, 0)
    this.groundRenderTexture.setDepth(0)

    // Pick between the two plain tiles randomly (seeded) so adjacent tiles differ slightly
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const key = availableTiles[this.rng.integerInRange(0, availableTiles.length - 1)]
        this.groundRenderTexture.draw(key, c * TILE_SIZE, r * TILE_SIZE)
      }
    }

    // Apply per-tile tint variation as a semi-transparent overlay drawn with graphics
    // This gives ~5% lighter/darker patches without touching the tile picker
    this.applyGroundVariationOverlay()

    this.applyPlanetVisuals()
  }

  /**
   * Draws a low-opacity noise overlay on top of the ground render texture
   * to give subtle lighter/darker variation without using messy tiles.
   */
  private applyGroundVariationOverlay() {
    // Use a separate seeded RNG so the variation doesn't affect other seeded placements
    const varRng = new Phaser.Math.RandomDataGenerator(['ground_var_42'])
    const overlay = this.add.graphics()
    overlay.setDepth(0) // same layer as ground, drawn after render texture

    // Scatter ~300 semi-transparent patches of slightly lighter or darker orange
    for (let i = 0; i < 300; i++) {
      const x = varRng.integerInRange(0, MAP_W)
      const y = varRng.integerInRange(0, MAP_H)
      const w = varRng.integerInRange(60, 180)
      const h = varRng.integerInRange(40, 120)
      const lighter = varRng.between(0, 1) === 1
      // Mars: slightly lighter (e38060) or darker (8c3318) patch at ~6% opacity
      const col = lighter ? 0xe38060 : 0x8c3318
      overlay.fillStyle(col, 0.06)
      overlay.fillEllipse(x, y, w, h)
    }
  }

  private buildGroundFallback() {
    // No tiles loaded at all — draw a solid base color with code-only variation
    const gfx = this.add.graphics()
    gfx.setDepth(0)

    const isMoon = useGameStore.getState().planet === 'moon'
    const baseColor = isMoon ? 0x6b7280 : 0xb8562a
    gfx.fillStyle(baseColor, 1)
    gfx.fillRect(0, 0, MAP_W, MAP_H)

    // Scatter variation patches
    const varRng = new Phaser.Math.RandomDataGenerator(['ground_var_42'])
    for (let i = 0; i < 350; i++) {
      const x = varRng.integerInRange(0, MAP_W)
      const y = varRng.integerInRange(0, MAP_H)
      const w = varRng.integerInRange(50, 200)
      const h = varRng.integerInRange(40, 130)
      const lighter = varRng.between(0, 1) === 1
      const col = isMoon
        ? lighter ? 0x9ca3af : 0x4b5563
        : lighter ? 0xd4714a : 0x8c3318
      gfx.fillStyle(col, 0.07)
      gfx.fillEllipse(x, y, w, h)
    }
  }

  private applyPlanetVisuals() {
    const planetId = useGameStore.getState().planet
    const planetConfig = PLANETS[planetId]

    if (this.groundRenderTexture) {
      if (planetId === 'moon') {
        // Gray multiply tint for Moon
        this.groundRenderTexture.setTint(planetConfig.groundTint)
      } else {
        this.groundRenderTexture.clearTint()
      }
    }

    // Tint rocks for Moon (gray) vs Mars (warm orange)
    this.rockSprites.forEach((rock) => {
      if (rock instanceof Phaser.GameObjects.Image) {
        if (planetId === 'moon') {
          rock.setTint(0x94a3b8)
        } else {
          // For Mars, env01/env02 are already warm brown — apply a subtle warm tint
          rock.setTint(0xd4855a)
        }
      }
    })

    if (this.dustEmitter && !planetConfig.hasAtmosphereDust) {
      this.dustEmitter.stop()
    }
  }

  private drawCraters() {
    if (this.cratersGraphics) {
      this.cratersGraphics.destroy()
    }

    const isMoon = useGameStore.getState().planet === 'moon'

    this.cratersGraphics = this.add.graphics()
    this.cratersGraphics.setDepth(1)

    // Use a fresh seeded RNG for craters that is independent of rock/tile RNG
    const craterRng = new Phaser.Math.RandomDataGenerator(['craters_42'])

    const craterCount = 50
    for (let i = 0; i < craterCount; i++) {
      const cx = craterRng.integerInRange(100, MAP_W - 100)
      const cy = craterRng.integerInRange(100, MAP_H - 100)
      const rx = craterRng.integerInRange(28, 95)
      const ry = Math.round(rx * craterRng.realInRange(0.55, 0.85)) // slightly elliptical

      // Skip if too close to base
      if (Phaser.Math.Distance.Between(cx, cy, BASE_X, BASE_Y) < 200) continue

      if (isMoon) {
        // Moon craters: lighter, more visible (gray palette)
        // Subtle darker floor
        this.cratersGraphics.fillStyle(0x374151, 0.22)
        this.cratersGraphics.fillEllipse(cx, cy, rx * 2, ry * 2)
        // Soft lighter rim
        this.cratersGraphics.lineStyle(3, 0x9ca3af, 0.3)
        this.cratersGraphics.strokeEllipse(cx, cy, (rx + 5) * 2, (ry + 4) * 2)
      } else {
        // Mars craters: subtle darker floor, faint lighter rim
        this.cratersGraphics.fillStyle(0x6b2810, 0.22)
        this.cratersGraphics.fillEllipse(cx, cy, rx * 2, ry * 2)
        // Lighter rim highlight on the top-left edge only
        this.cratersGraphics.lineStyle(3, 0xd4714a, 0.25)
        this.cratersGraphics.strokeEllipse(cx, cy, (rx + 5) * 2, (ry + 4) * 2)
      }
    }
  }

  private scatterRocks(checkFailed: (k: string) => boolean) {
    // Choose correct rock keys per planet
    const isMoon = useGameStore.getState().planet === 'moon'
    const preferredKeys = isMoon ? MOON_ROCK_KEYS : MARS_ROCK_KEYS

    const rockKeys = preferredKeys.filter((k) => !checkFailed(k))

    // Low density — 90 rocks spread over a 4000x4000 map
    const count = 90
    const rockRng = new Phaser.Math.RandomDataGenerator(['rocks_42'])

    for (let i = 0; i < count; i++) {
      let x: number, y: number
      let attempts = 0
      do {
        x = rockRng.integerInRange(32, MAP_W - 32)
        y = rockRng.integerInRange(32, MAP_H - 32)
        attempts++
      } while (
        Phaser.Math.Distance.Between(x, y, BASE_X, BASE_Y) < 300 &&
        attempts < 20
      )

      if (rockKeys.length > 0) {
        const key = rockKeys[rockRng.integerInRange(0, rockKeys.length - 1)]
        const scale = rockRng.realInRange(0.45, 1.0)
        const img = this.add.image(x, y, key)
        img.setScale(scale)
        img.setAlpha(rockRng.realInRange(0.80, 1.0))
        img.setDepth(2)

        if (isMoon) {
          img.setTint(0x94a3b8) // gray tint for Moon
        } else {
          img.setTint(0xd4855a) // warm orange-brown tint for Mars
        }

        this.rockSprites.push(img)
      } else {
        // Fallback: draw a simple ellipse rock shape
        const gfx = this.add.graphics()
        gfx.setDepth(2)
        const rw = rockRng.integerInRange(14, 40)
        const rh = rockRng.integerInRange(8, 24)
        const rockCol = isMoon ? 0x475569 : 0x7a4a2a
        const rimCol  = isMoon ? 0x64748b : 0xa06030
        gfx.fillStyle(rockCol, 0.9)
        gfx.fillEllipse(x, y, rw, rh)
        gfx.fillStyle(rimCol, 0.4)
        gfx.fillEllipse(x - rw * 0.15, y - rh * 0.25, rw * 0.5, rh * 0.4)
        this.rockSprites.push(gfx)
      }
    }
  }

  private placeBase(checkFailed: (k: string) => boolean) {
    if (!checkFailed('base')) {
      const baseSprite = this.add.image(BASE_X, BASE_Y, 'base')
      // 1.5x bigger than the original 1.0 scale
      baseSprite.setScale(1.5)
      baseSprite.setDepth(10)
    } else {
      // Fallback: drawn base
      const gfx = this.add.graphics()
      gfx.setDepth(10)
      const r = 56
      gfx.fillStyle(0x888888, 1)
      gfx.lineStyle(4, 0xaaaaaa, 1)
      const pts: Phaser.Types.Math.Vector2Like[] = []
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i - Math.PI / 8
        pts.push({ x: BASE_X + r * Math.cos(angle), y: BASE_Y + r * Math.sin(angle) })
      }
      gfx.fillPoints(pts, true)
      gfx.strokePoints(pts, true)
      gfx.fillStyle(0x4488aa, 0.85)
      gfx.fillCircle(BASE_X, BASE_Y, 28)
    }

    // Subtle home-zone halo circle (safe distance boundary)
    const halo = this.add.graphics()
    halo.setDepth(3)
    halo.lineStyle(2, 0x38bdf8, 0.35)
    halo.strokeCircle(BASE_X, BASE_Y, BASE_SAFE_DISTANCE)
  }

  // ------------------------------------------------------------------ Discovery Spots

  private refreshDiscoverySpots() {
    this.spotContainers.forEach((c) => c.destroy())
    this.spotContainers.clear()

    const spots = useGameStore.getState().discoverySpots

    spots.forEach((spot) => {
      if (spot.collected) return

      const container = this.add.container(spot.x, spot.y)
      container.setDepth(8)

      // --- Glow ring: bright, clearly visible, pulsing ---
      // Rock = amber ring, Riverbed = orange ring, Ice = cyan ring
      const ringColor =
        spot.type === 'rock'
          ? 0xfbbf24   // amber
          : spot.type === 'riverbed'
          ? 0xf97316   // orange
          : 0x22d3ee   // cyan

      const ringRadius =
        spot.type === 'rock' ? 32 : spot.type === 'riverbed' ? 38 : 44

      // Filled glow circle (low opacity)
      const glowFill = this.add.graphics()
      glowFill.fillStyle(ringColor, 0.18)
      glowFill.fillCircle(0, 0, ringRadius)
      container.add(glowFill)

      // Bright pulsing ring stroke
      const glowRing = this.add.graphics()
      glowRing.lineStyle(3, ringColor, 0.9)
      glowRing.strokeCircle(0, 0, ringRadius)
      // Second inner ring for depth
      glowRing.lineStyle(1.5, ringColor, 0.5)
      glowRing.strokeCircle(0, 0, ringRadius - 6)
      container.add(glowRing)

      // Pulse the ring scale and alpha
      this.tweens.add({
        targets: glowRing,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: { from: 0.6, to: 1.0 },
        yoyo: true,
        repeat: -1,
        duration: 900 + (spot.x % 400),
        ease: 'Sine.easeInOut',
      })
      // Also pulse the fill glow independently
      this.tweens.add({
        targets: glowFill,
        scaleX: 1.15,
        scaleY: 1.15,
        alpha: { from: 0.12, to: 0.35 },
        yoyo: true,
        repeat: -1,
        duration: 1200 + (spot.y % 300),
        ease: 'Sine.easeInOut',
      })

      // --- Spot icon graphic ---
      const graphic = this.add.graphics()

      if (spot.type === 'rock') {
        // Simple rock cluster, clearly visible over orange ground
        graphic.fillStyle(0x4a2c10, 1)
        graphic.fillCircle(-7, -4, 12)
        graphic.fillStyle(0x6b3c18, 1)
        graphic.fillCircle(6, 2, 14)
        graphic.fillStyle(0x8c5230, 1)
        graphic.fillCircle(0, 5, 10)
        // Highlight specks
        graphic.fillStyle(0xfde68a, 0.8)
        graphic.fillCircle(-4, -7, 2.5)
        graphic.fillCircle(8, -1, 2)

      } else if (spot.type === 'riverbed') {
        // Layered strata bands
        graphic.fillStyle(0x6b3c10, 0.9)
        graphic.fillRoundedRect(-26, -16, 52, 32, 8)
        graphic.fillStyle(0x9a5c20, 0.95)
        graphic.fillRoundedRect(-22, -11, 44, 22, 6)
        graphic.fillStyle(0xc07828, 1)
        graphic.fillRoundedRect(-17, -6, 34, 12, 4)
        graphic.fillStyle(0xfef3c7, 0.75)
        graphic.fillRect(-13, -1.5, 26, 3)

      } else {
        // Ice deposit — bright blue-white crystal
        graphic.fillStyle(0x0369a1, 0.9)
        graphic.fillCircle(0, 0, 20)
        graphic.fillStyle(0x38bdf8, 1)
        graphic.fillCircle(-4, -3, 14)
        graphic.fillStyle(0xbae6fd, 1)
        graphic.fillCircle(3, 2, 10)
        graphic.fillStyle(0xffffff, 1)
        graphic.fillCircle(0, 0, 5)
        // Ice cross glint
        graphic.lineStyle(2, 0xffffff, 0.85)
        graphic.lineBetween(-16, 0, 16, 0)
        graphic.lineBetween(0, -16, 0, 16)
      }
      container.add(graphic)

      // Floating emoji icon above
      const iconChar = spot.type === 'rock' ? '🪨' : spot.type === 'riverbed' ? '〰️' : '❄️'
      const iconText = this.add.text(0, -34, iconChar, { fontSize: '16px' })
      iconText.setOrigin(0.5, 0.5)
      container.add(iconText)

      this.spotContainers.set(spot.id, container)
    })
  }

  private createRover(checkFailed: (k: string) => boolean) {
    // Shadow ellipse drawn below rover
    this.roverShadow = this.add.ellipse(BASE_X, BASE_Y + 10, 72, 24, 0x000000, 0.35)
    this.roverShadow.setDepth(11)

    if (!checkFailed('rover')) {
      this.rover = this.physics.add.image(BASE_X, BASE_Y, 'rover')
      // 1.5× bigger than the original 0.85 scale
      this.rover.setScale(1.3)
    } else {
      // Fallback drawn rover
      const rCanvas = this.make.graphics()
      rCanvas.setVisible(false)
      rCanvas.fillStyle(0xdddddd, 1)
      rCanvas.fillRoundedRect(0, 0, 54, 36, 7)
      rCanvas.fillStyle(0x333333, 1)
      rCanvas.fillRect(4, -4, 11, 9)
      rCanvas.fillRect(39, -4, 11, 9)
      rCanvas.fillRect(4, 31, 11, 9)
      rCanvas.fillRect(39, 31, 11, 9)
      rCanvas.fillStyle(0x38bdf8, 1)
      rCanvas.fillCircle(40, 18, 7)
      rCanvas.generateTexture('fallback_rover', 58, 40)

      this.rover = this.physics.add.image(BASE_X, BASE_Y, 'fallback_rover')
    }

    this.rover.setDepth(12)
    this.roverBody = this.rover.body as Phaser.Physics.Arcade.Body
    this.roverBody.setCollideWorldBounds(true)
    this.roverBody.setSize(40, 40)
  }

  private createDustParticles() {
    const dustKey = 'dust_particle'
    if (!this.textures.exists(dustKey)) {
      const g = this.make.graphics()
      g.setVisible(false)
      g.fillStyle(0xd97736, 1)
      g.fillCircle(4, 4, 4)
      g.generateTexture(dustKey, 8, 8)
    }

    const particles = this.add.particles(0, 0, dustKey, {
      speed: { min: 10, max: 30 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 400,
      frequency: 45,
      emitting: false,
    })
    this.dustEmitter = particles
    this.dustEmitter.setDepth(11)
  }

  // ------------------------------------------------------------------ update

  update(_time: number, delta: number) {
    const store = useGameStore.getState()
    const {
      isGameStarted,
      isPoweredOff,
      isControlsLocked,
      dayPhase,
      joystickDx,
      joystickDy,
      activeScan,
      planet,
    } = store

    const dt = delta / 1000

    if (!isGameStarted) {
      return
    }

    store.tickDayTimer(dt)

    if (activeScan) {
      store.tickScan(dt)
    }

    this.renderScanRing(store.activeScan)

    // Update rover shadow position to follow rover
    if (this.roverShadow && this.rover) {
      this.roverShadow.setPosition(this.rover.x, this.rover.y + 12)
    }

    if (isPoweredOff || isControlsLocked || dayPhase === 'ended' || dayPhase === 'morning') {
      this.roverBody.setVelocity(0, 0)
      if (this.dustEmitter && this.dustEmitter.emitting) this.dustEmitter.stop()
      store.setIsDriving(false)
      store.setRoverPos(this.rover.x, this.rover.y)
      return
    }

    // --- Movement ---
    let vx = 0
    let vy = 0

    const leftHeld  = this.cursors.left.isDown  || this.wasd.left.isDown
    const rightHeld = this.cursors.right.isDown || this.wasd.right.isDown
    const upHeld    = this.cursors.up.isDown    || this.wasd.up.isDown
    const downHeld  = this.cursors.down.isDown  || this.wasd.down.isDown

    if (leftHeld)  vx -= ROVER_SPEED
    if (rightHeld) vx += ROVER_SPEED
    if (upHeld)    vy -= ROVER_SPEED
    if (downHeld)  vy += ROVER_SPEED

    if (joystickDx !== 0 || joystickDy !== 0) {
      vx = joystickDx * ROVER_SPEED
      vy = joystickDy * ROVER_SPEED
    }

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy)
      vx = (vx / len) * ROVER_SPEED
      vy = (vy / len) * ROVER_SPEED
    }

    this.roverBody.setVelocity(vx, vy)

    const driving = vx !== 0 || vy !== 0

    if (driving) {
      const angle = Math.atan2(vy, vx)
      this.rover.setRotation(angle)
      // Squash shadow slightly when moving
      if (this.roverShadow) {
        this.roverShadow.setScale(1.0, 0.85)
      }
    } else {
      if (this.roverShadow) {
        this.roverShadow.setScale(1.0, 1.0)
      }
    }

    const planetConfig = PLANETS[planet]

    if (driving) {
      const stepDist = Math.sqrt(vx * vx + vy * vy) * dt
      store.addDistanceDriven(stepDist)

      if (planetConfig.hasAtmosphereDust) {
        const angle = Math.atan2(vy, vx)
        const ex = this.rover.x - Math.cos(angle) * 32
        const ey = this.rover.y - Math.sin(angle) * 32
        this.dustEmitter.setPosition(ex, ey)
        if (!this.dustEmitter.emitting) this.dustEmitter.start()
      } else {
        if (this.dustEmitter.emitting) this.dustEmitter.stop()
      }
    } else {
      if (this.dustEmitter && this.dustEmitter.emitting) this.dustEmitter.stop()
    }

    store.setIsDriving(driving)

    const dist = Phaser.Math.Distance.Between(this.rover.x, this.rover.y, BASE_X, BASE_Y)
    let battery = store.battery

    if (driving) {
      const drainRate = BATTERY_DRAIN_DRIVING * planetConfig.batteryDrainMultiplier
      battery -= drainRate * dt
    } else if (dist < BASE_SAFE_DISTANCE) {
      battery += BATTERY_RECHARGE_BASE * dt
    }

    battery = Phaser.Math.Clamp(battery, 0, store.batteryCapacity)
    store.setBattery(battery)

    if (battery <= 0 && !isPoweredOff) {
      store.setIsPoweredOff(true)
    }

    store.setRoverPos(this.rover.x, this.rover.y)

    // Proximity check for Discovery Spots
    const spots = store.discoverySpots.filter((s) => !s.collected)
    let closestSpot: DiscoverySpot | null = null
    let closestDist = Infinity

    for (const spot of spots) {
      const d = Phaser.Math.Distance.Between(this.rover.x, this.rover.y, spot.x, spot.y)
      if (d <= SCAN_PROXIMITY_RADIUS && d < closestDist) {
        closestDist = d
        closestSpot = spot
      }
    }

    if (store.nearbySpot?.id !== closestSpot?.id) {
      store.setNearbySpot(closestSpot)
    }

    // Space key scan trigger
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (closestSpot && !store.activeScan && !driving && !isControlsLocked) {
        store.startScan()
      }
    }
  }

  // Draw 3-second circular progress ring around rover during scanning
  private renderScanRing(activeScan: { elapsed: number; duration: number } | null) {
    this.scanGraphics.clear()
    if (!activeScan || !this.rover) return

    const rx = this.rover.x
    const ry = this.rover.y
    const radius = 42 // slightly larger to match bigger rover
    const progress = Math.min(1, activeScan.elapsed / activeScan.duration)

    // Background track ring
    this.scanGraphics.lineStyle(4, 0x1e293b, 0.7)
    this.scanGraphics.strokeCircle(rx, ry, radius)

    // Foreground progress arc
    this.scanGraphics.lineStyle(4, 0x06b6d4, 1.0)
    this.scanGraphics.beginPath()
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + progress * Math.PI * 2
    this.scanGraphics.arc(rx, ry, radius, startAngle, endAngle, false)
    this.scanGraphics.strokePath()

    // Expanding radar ping
    const pingProgress = (activeScan.elapsed * 1.5) % 1
    const pingRadius = radius * (0.8 + pingProgress * 0.8)
    const pingAlpha = (1 - pingProgress) * 0.5
    this.scanGraphics.lineStyle(2, 0x38bdf8, pingAlpha)
    this.scanGraphics.strokeCircle(rx, ry, pingRadius)
  }
}
