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
  SUNSET_WARN_SEC,
} from '../config/gameConfig'
import { PLANETS } from '../config/planets'
import { STORM_STRENGTHS } from '../config/balance'
import { DiscoverySpot } from '../data/discoverySpots'
import { debugLogger } from '../utils/debugLogger'
import {
  buildMoonGroundTexture,
  generateBaseTexture,
  generateRoverTexture,
  generateDustParticleTexture,
} from '../utils/textureGenerators'
import { isLowQualityMode, setLowQualityMode } from '../utils/qualitySettings'

const MAP_W = 4000
const MAP_H = 4000
const GROUND_PAD = 2000
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
  private groundTileSprite!: Phaser.GameObjects.TileSprite
  private cratersGraphics!: Phaser.GameObjects.Graphics
  private rockSprites: (Phaser.GameObjects.Image | Phaser.GameObjects.Graphics)[] = []

  // Stage 6 & 7A: Discoveries & Scanning Graphics
  private spotContainers: Map<string, Phaser.GameObjects.Container> = new Map()
  private scanGraphics!: Phaser.GameObjects.Graphics

  // Darkness Overlay (depth 6: covers ground/rocks, sits under base/shield/rover)
  private darknessOverlayGfx!: Phaser.GameObjects.Graphics

  // Outpost Base & Shield Bubble
  private baseContainer!: Phaser.GameObjects.Container
  private baseLightsContainer!: Phaser.GameObjects.Container
  private baseWindowsGfx!: Phaser.GameObjects.Graphics
  private solarPanelsDimGfx!: Phaser.GameObjects.Graphics
  private chargingBoltText!: Phaser.GameObjects.Text
  private antennaLight!: Phaser.GameObjects.Arc

  // Shield Bubble Visuals (depth 20: above darkness overlay)
  private shieldContainer!: Phaser.GameObjects.Container
  private shieldPulseContainer!: Phaser.GameObjects.Container
  private shieldFillGfx!: Phaser.GameObjects.Graphics
  private shieldRimGfx!: Phaser.GameObjects.Graphics
  private shieldOuterGlowGfx!: Phaser.GameObjects.Graphics
  private shieldDashedGfx!: Phaser.GameObjects.Graphics
  private shieldRipplesGfx!: Phaser.GameObjects.Graphics
  private shieldTween!: Phaser.Tweens.Tween
  private shieldAlphaTween!: Phaser.Tweens.Tween

  // Ripple Pool
  private ripplePool: Phaser.GameObjects.Graphics[] = []
  private activeRipples: {
    gfx: Phaser.GameObjects.Graphics
    elapsed: number
    duration: number
    maxAlpha: number
    color: number
  }[] = []
  private rippleTimer: number = 0

  // Shield Entrance/Exit Bounce & Rim Flash
  private prevRoverSheltered: boolean | null = null
  private shieldFlashColor: number = 0x22c55e
  private shieldFlashAlpha: number = 0

  // Shield Label Pill (depth 22: crisp, inverted zoom, no emoji)
  private shieldLabelContainer!: Phaser.GameObjects.Container
  private shieldLabelPillGfx!: Phaser.GameObjects.Graphics
  private shieldLabelIconGfx!: Phaser.GameObjects.Graphics
  private shieldLabelText!: Phaser.GameObjects.Text

  private headlightGfx!: Phaser.GameObjects.Graphics

  // First-frame sentinel for BlackScreenGuard
  private _firstFrameFired = false

  // HUD Update Throttling (max 10 Hz / every 100ms)
  private hudThrottleTimer: number = 0
  private lastReportedBattery: number = -1
  private lastReportedDriving: boolean | null = null
  private lastReportedRoverX: number = -1
  private lastReportedRoverY: number = -1
  private accumulatedDistance: number = 0
  private accumulatedTimerDt: number = 0
  private accumulatedScanDt: number = 0
  private localBattery: number = -1

  // First 60 frames FPS auto-sampling
  private fpsSamples: number[] = []
  private fpsChecked: boolean = false

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

    // ---- 3B. DARKNESS OVERLAY (depth 15: covers ground/rocks/base body, sits under shield/windows/antenna) ----
    this.darknessOverlayGfx = this.add.graphics()
    this.darknessOverlayGfx.setDepth(15)
    this.darknessOverlayGfx.setScrollFactor(0)

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
    this.updateCameraZoom()

    // Listen to ScaleManager resize events
    this.scale.on('resize', this.handleResize, this)

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
      this.scale.off('resize', this.handleResize, this)
      window.removeEventListener('reset-rover-to-base', handleReset)
      window.removeEventListener('planet-changed', handlePlanetChanged)
      window.removeEventListener('discovery-collected', handleCollected)
    })
  }

  // ------------------------------------------------------------------ helpers

  /**
   * Sets camera zoom based on the current viewport dimensions so world visibility
   * remains consistent across small screens, laptops, and ultra-wide desktop monitors.
   * Targets ~1100 world pixels on the shorter screen side, clamped between 0.6 and 1.4.
   */
  private updateCameraZoom() {
    const width = this.scale.width
    const height = this.scale.height
    if (!width || !height) return

    const shorterSide = Math.min(width, height)
    const targetWorldSpan = 1100
    const calculatedZoom = shorterSide / targetWorldSpan
    const clampedZoom = Math.max(0.6, Math.min(1.4, calculatedZoom))

    this.cameras.main.setZoom(clampedZoom)
  }

  /**
   * Refreshes camera viewport, zoom, bounds clamping, and ground coverage
   * whenever the canvas or container resizes in either direction.
   */
  public refreshViewport(width?: number, height?: number) {
    if (!this.cameras || !this.cameras.main) return
    const w = width ?? this.scale.width
    const h = height ?? this.scale.height
    if (!w || !h) return

    this.cameras.main.setSize(w, h)
    this.updateCameraZoom()
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)

    // Ensure ground sprite extends far enough to cover any large viewport
    if (this.groundTileSprite) {
      const extraPad = Math.max(w, h, GROUND_PAD)
      this.groundTileSprite.setSize(MAP_W + extraPad * 2, MAP_H + extraPad * 2)
    }

    // Refresh full-screen tint overlays to match new dimensions and zoom
    this.updateTintOverlays()
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.refreshViewport(gameSize.width, gameSize.height)
  }

  private buildGround(checkFailed: (k: string) => boolean) {
    const isMoon = useGameStore.getState().planet === 'moon'

    // Moon: generate a pure code-drawn gray ground texture — no Kenney tiles at all
    if (isMoon) {
      this.buildMoonGround()
      return
    }

    // Mars: use Kenney plain terracotta tiles
    const availableTiles = MARS_GROUND_TILES.filter((k) => !checkFailed(k))

    // If no plain tiles loaded, fall back to solid color rectangle with variation
    if (availableTiles.length === 0) {
      this.buildGroundFallback()
      return
    }

    // High-performance hardware TileSprite with generous border padding so no black borders ever show
    const key = availableTiles[0]
    this.groundTileSprite = this.add.tileSprite(
      MAP_W / 2,
      MAP_H / 2,
      MAP_W + GROUND_PAD * 2,
      MAP_H + GROUND_PAD * 2,
      key
    )
    this.groundTileSprite.setDepth(0)

    // Apply per-tile tint variation as a semi-transparent overlay drawn with graphics
    // This gives ~5% lighter/darker patches without touching the tile picker
    this.applyGroundVariationOverlay()

    this.applyPlanetVisuals()
  }

  /**
   * Builds the Moon ground entirely in code — a 256×256 canvas texture tiled
   * across the full map. No Kenney tiles are used. Produces neutral gray (#8a8a8a)
   * with seeded lighter/darker patches (~8%) and fine speckle noise.
   */
  private buildMoonGround() {
    const TEX_KEY = buildMoonGroundTexture(this.textures)

    this.groundTileSprite = this.add.tileSprite(
      MAP_W / 2,
      MAP_H / 2,
      MAP_W + GROUND_PAD * 2,
      MAP_H + GROUND_PAD * 2,
      TEX_KEY
    )
    this.groundTileSprite.setDepth(0)
    // No tint — the texture is already the correct color
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
    gfx.fillRect(-GROUND_PAD, -GROUND_PAD, MAP_W + GROUND_PAD * 2, MAP_H + GROUND_PAD * 2)

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

    if (this.groundTileSprite) {
      // Moon uses its own code-generated gray texture — no tint needed or wanted.
      // Mars tiles already have the right color — just clear any leftover tint.
      this.groundTileSprite.clearTint()
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

    if (isMoon) {
      // --- Moon: more craters, bigger, some clustered ---
      const craterCount = 120
      for (let i = 0; i < craterCount; i++) {
        const cx = craterRng.integerInRange(100, MAP_W - 100)
        const cy = craterRng.integerInRange(100, MAP_H - 100)
        const rx = craterRng.integerInRange(20, 140)
        const ry = Math.round(rx * craterRng.realInRange(0.55, 0.85))

        if (Phaser.Math.Distance.Between(cx, cy, BASE_X, BASE_Y) < 220) continue

        this.drawMoonCrater(cx, cy, rx, ry)

        // For large craters, cluster 2-4 smaller ones nearby
        if (rx > 70) {
          const clusterCount = craterRng.integerInRange(2, 4)
          for (let j = 0; j < clusterCount; j++) {
            const angle = craterRng.realInRange(0, Math.PI * 2)
            const dist = craterRng.realInRange(rx * 0.8, rx * 1.6)
            const mx = cx + Math.cos(angle) * dist
            const my = cy + Math.sin(angle) * dist
            const mr = craterRng.integerInRange(8, 28)
            const mry = Math.round(mr * craterRng.realInRange(0.6, 0.85))
            if (
              mx > 50 && mx < MAP_W - 50 &&
              my > 50 && my < MAP_H - 50 &&
              Phaser.Math.Distance.Between(mx, my, BASE_X, BASE_Y) > 150
            ) {
              this.drawMoonCrater(mx, my, mr, mry)
            }
          }
        }
      }
    } else {
      // --- Mars: 50 subtle craters ---
      const craterCount = 50
      for (let i = 0; i < craterCount; i++) {
        const cx = craterRng.integerInRange(100, MAP_W - 100)
        const cy = craterRng.integerInRange(100, MAP_H - 100)
        const rx = craterRng.integerInRange(28, 95)
        const ry = Math.round(rx * craterRng.realInRange(0.55, 0.85))

        if (Phaser.Math.Distance.Between(cx, cy, BASE_X, BASE_Y) < 200) continue

        // Subtle darker floor
        this.cratersGraphics.fillStyle(0x6b2810, 0.22)
        this.cratersGraphics.fillEllipse(cx, cy, rx * 2, ry * 2)
        // Lighter rim highlight
        this.cratersGraphics.lineStyle(3, 0xd4714a, 0.25)
        this.cratersGraphics.strokeEllipse(cx, cy, (rx + 5) * 2, (ry + 4) * 2)
      }
    }
  }

  /**
   * Draws a single Moon crater: darker floor + offset inner shadow (sun-side) + lighter rim.
   * Kept at low contrast so discovery spots still pop.
   */
  private drawMoonCrater(cx: number, cy: number, rx: number, ry: number) {
    // Darker floor
    this.cratersGraphics.fillStyle(0x696969, 0.30)
    this.cratersGraphics.fillEllipse(cx, cy, rx * 2, ry * 2)

    // Soft inner shadow on the sun side (top-left offset) — lighter patch
    const shadowOffX = -rx * 0.25
    const shadowOffY = -ry * 0.25
    this.cratersGraphics.fillStyle(0xb0b0b0, 0.12)
    this.cratersGraphics.fillEllipse(
      cx + shadowOffX,
      cy + shadowOffY,
      rx * 1.0,
      ry * 1.0
    )

    // Lighter rim
    const rimW = Math.max(2, Math.min(4, rx / 25))
    this.cratersGraphics.lineStyle(rimW, 0xc8c8c8, 0.35)
    this.cratersGraphics.strokeEllipse(cx, cy, (rx + 4) * 2, (ry + 3) * 2)
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
          img.setTint(0x9ca3af) // neutral gray tint for Moon (no blue-gray undertone)
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

  // ------------------------------------------------------------------ Base & Rover Textures

  /**
   * Generates a high-quality top-down habitat base texture once and caches it.
   * Central dome + 2 connected pods + 2 solar arrays + landing pad with "H" marker + antenna + soft shadow.
   */
  private generateBaseTexture(isMoon: boolean): string {
    return generateBaseTexture(this.textures, isMoon)
  }

  /**
   * Generates a 1.5x bigger high-detail rover texture:
   * 4 rugged wheels with hubcaps, scientific chassis, solar rear deck, instrument pod, camera turret, headlights.
   */
  private generateRoverTexture(): string {
    return generateRoverTexture(this.textures)
  }

  private placeBase(_checkFailed: (k: string) => boolean) {
    const isMoon = useGameStore.getState().planet === 'moon'
    const baseTexKey = this.generateBaseTexture(isMoon)

    // 1. Base Habitat Outpost Container (depth 10, sits under darkness)
    this.baseContainer = this.add.container(BASE_X, BASE_Y)
    this.baseContainer.setDepth(10)

    // Static pre-rendered base sprite (centered so landing pad sits right at 0, 0)
    const baseSprite = this.add.image(0, 0, baseTexKey)
    this.baseContainer.add(baseSprite)

    // Solar panels dimming overlay
    this.solarPanelsDimGfx = this.add.graphics()
    this.baseContainer.add(this.solarPanelsDimGfx)

    // Pulsing charging bolt text (floats above landing pad when rover is charging)
    this.chargingBoltText = this.add.text(0, -6, '⚡', {
      fontSize: '26px',
    })
    this.chargingBoltText.setOrigin(0.5, 0.5)
    this.chargingBoltText.setVisible(false)
    this.baseContainer.add(this.chargingBoltText)
    this.tweens.add({
      targets: this.chargingBoltText,
      scale: { from: 0.9, to: 1.3 },
      alpha: { from: 0.6, to: 1.0 },
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut',
    })

    // 1B. Base Lights Container (depth 21: ABOVE darkness overlay at depth 15)
    this.baseLightsContainer = this.add.container(BASE_X, BASE_Y)
    this.baseLightsContainer.setDepth(21)

    // Dynamic windows on dome and pods
    this.baseWindowsGfx = this.add.graphics()
    this.baseLightsContainer.add(this.baseWindowsGfx)

    // Blinking antenna beacon light on antenna tower tip (at x: 26, y: -96)
    const beaconCol = isMoon ? 0x38bdf8 : 0xef4444
    this.antennaLight = this.add.circle(26, -96, 3.5, beaconCol, 1)
    this.baseLightsContainer.add(this.antennaLight)
    this.tweens.add({
      targets: this.antennaLight,
      alpha: { from: 0.2, to: 1.0 },
      yoyo: true,
      repeat: -1,
      duration: 850,
      ease: 'Sine.easeInOut',
    })

    // 2. Shield Bubble Container (depth 20: ABOVE darkness overlay)
    this.shieldContainer = this.add.container(BASE_X, BASE_Y)
    this.shieldContainer.setDepth(20)

    // Pulse Container inside shieldContainer: handles continuous 1.0 to 1.05 breathing loop
    this.shieldPulseContainer = this.add.container(0, 0)
    this.shieldContainer.add(this.shieldPulseContainer)

    this.shieldFillGfx = this.add.graphics()
    this.shieldPulseContainer.add(this.shieldFillGfx)

    this.shieldOuterGlowGfx = this.add.graphics()
    this.shieldOuterGlowGfx.setBlendMode(Phaser.BlendModes.ADD)
    this.shieldPulseContainer.add(this.shieldOuterGlowGfx)

    this.shieldRimGfx = this.add.graphics()
    this.shieldRimGfx.setBlendMode(Phaser.BlendModes.ADD)
    this.shieldPulseContainer.add(this.shieldRimGfx)

    this.shieldDashedGfx = this.add.graphics()
    this.shieldDashedGfx.setBlendMode(Phaser.BlendModes.ADD)
    this.shieldPulseContainer.add(this.shieldDashedGfx)

    this.shieldRipplesGfx = this.add.graphics()
    this.shieldRipplesGfx.setBlendMode(Phaser.BlendModes.ADD)
    this.shieldPulseContainer.add(this.shieldRipplesGfx)

    // Pre-allocated Ripple Pool (6 Graphics)
    this.ripplePool = []
    this.activeRipples = []
    for (let i = 0; i < 6; i++) {
      const rip = this.add.graphics()
      rip.setBlendMode(Phaser.BlendModes.ADD)
      rip.setVisible(false)
      this.shieldPulseContainer.add(rip)
      this.ripplePool.push(rip)
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const pulseDuration = prefersReducedMotion ? 2000 : 800 // 4s loop vs 1.6s loop

    // Breathing pulse tween: scale 1.0 to 1.05
    this.shieldTween = this.tweens.add({
      targets: this.shieldPulseContainer,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      duration: pulseDuration,
      ease: 'Sine.easeInOut',
    })

    // Glow alpha breathing tween: alpha 1.0 to 0.5
    this.shieldAlphaTween = this.tweens.add({
      targets: [this.shieldOuterGlowGfx, this.shieldRimGfx],
      alpha: { from: 1.0, to: 0.5 },
      yoyo: true,
      repeat: -1,
      duration: pulseDuration,
      ease: 'Sine.easeInOut',
    })

    // 3. Shield Label Container (depth 22: crisp, inverted zoom, no emoji)
    this.shieldLabelContainer = this.add.container(BASE_X, BASE_Y - BASE_SAFE_DISTANCE - 26)
    this.shieldLabelContainer.setDepth(22)

    this.shieldLabelPillGfx = this.add.graphics()
    this.shieldLabelContainer.add(this.shieldLabelPillGfx)

    this.shieldLabelIconGfx = this.add.graphics()
    this.shieldLabelContainer.add(this.shieldLabelIconGfx)

    this.shieldLabelText = this.add.text(0, 0, '', {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#020617',
      strokeThickness: 3,
    })
    this.shieldLabelText.setOrigin(0, 0.5)
    this.shieldLabelText.setResolution(Math.max(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 2))
    this.shieldLabelContainer.add(this.shieldLabelText)
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

  private createRover(_checkFailed: (k: string) => boolean) {
    const isMoon = useGameStore.getState().planet === 'moon'
    const shadowAlpha = isMoon ? 0.70 : 0.35

    // 1. Shadow ellipse drawn below rover — sharper on Moon, proportional to 1.5x bigger rover
    this.roverShadow = this.add.ellipse(BASE_X, BASE_Y + 12, 92, 32, 0x000000, shadowAlpha)
    this.roverShadow.setDepth(11)

    // 2. Headlight cone beam graphics (drawn at depth 16 with ADD blend mode, cuts through darkness at sunset/night)
    this.headlightGfx = this.add.graphics()
    this.headlightGfx.setDepth(16)
    this.headlightGfx.setBlendMode(Phaser.BlendModes.ADD)
    this.drawHeadlightCone()
    this.headlightGfx.setVisible(false)

    // 3. Upgraded scientific rover sprite (1.5x bigger, 4 wheels, camera turret, scientific chassis)
    const roverKey = this.generateRoverTexture()
    const storeState = useGameStore.getState()
    const spawnX = typeof storeState.roverX === 'number' && !isNaN(storeState.roverX) ? storeState.roverX : BASE_X
    const spawnY = typeof storeState.roverY === 'number' && !isNaN(storeState.roverY) ? storeState.roverY : BASE_Y
    this.rover = this.physics.add.image(spawnX, spawnY, roverKey)
    this.rover.setDepth(12)
    this.roverBody = this.rover.body as Phaser.Physics.Arcade.Body
    this.roverBody.setCollideWorldBounds(true)
    this.roverBody.setSize(54, 38)
  }

  /**
   * Draws a warm forward headlight cone beam extending ~150px in front of the rover.
   */
  private drawHeadlightCone() {
    this.headlightGfx.clear()
    // Soft outer cone
    this.headlightGfx.fillStyle(0xfffee0, 0.16)
    this.headlightGfx.beginPath()
    this.headlightGfx.moveTo(34, -6)
    this.headlightGfx.lineTo(150, -48)
    this.headlightGfx.lineTo(150, 48)
    this.headlightGfx.lineTo(34, 6)
    this.headlightGfx.closePath()
    this.headlightGfx.fillPath()

    // Bright inner core
    this.headlightGfx.fillStyle(0xffffff, 0.28)
    this.headlightGfx.beginPath()
    this.headlightGfx.moveTo(34, -3)
    this.headlightGfx.lineTo(100, -22)
    this.headlightGfx.lineTo(100, 22)
    this.headlightGfx.lineTo(34, 3)
    this.headlightGfx.closePath()
    this.headlightGfx.fillPath()
  }

  private createDustParticles() {
    generateDustParticleTexture(this.textures)
    const lowQ = isLowQualityMode()
    const particles = this.add.particles(0, 0, 'dust_particle', {
      speed: { min: 10, max: 25 },
      scale: { start: lowQ ? 0.5 : 0.8, end: 0 },
      alpha: { start: lowQ ? 0.3 : 0.5, end: 0 },
      lifespan: lowQ ? 250 : 400,
      frequency: lowQ ? 90 : 45,
      maxParticles: lowQ ? 12 : 28,
      emitting: false,
    })
    this.dustEmitter = particles
    this.dustEmitter.setDepth(11)
  }

  // ------------------------------------------------------------------ update

  update(_time: number, delta: number) {
    debugLogger.incrementFrameCount()

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

    // FPS auto-detection (first 60 frames) → enable low quality if avg < 40 FPS
    if (!this.fpsChecked && delta > 0) {
      this.fpsSamples.push(1000 / delta)
      if (this.fpsSamples.length >= 60) {
        this.fpsChecked = true
        const avgFps = this.fpsSamples.reduce((a, b) => a + b, 0) / 60
        if (avgFps < 40 && !isLowQualityMode()) {
          setLowQualityMode(true)
        }
      }
    }

    // Initialise local battery mirror on first active frame
    if (this.localBattery < 0) this.localBattery = store.battery

    // Notify BlackScreenGuard that the canvas is rendering (once only)
    if (!this._firstFrameFired) {
      this._firstFrameFired = true
      window.dispatchEvent(new Event('phaser-frame-rendered'))
    }

    // Accumulate dt for HUD flush (timers & scan advance in the flush below)
    this.accumulatedTimerDt += dt

    if (activeScan) {
      this.accumulatedScanDt += dt
    }

    this.renderScanRing(store.activeScan)

    // Update rover shadow position to follow rover
    if (this.roverShadow && this.rover) {
      this.roverShadow.setPosition(this.rover.x, this.rover.y + 12)
    }

    // Update rover headlight beam position & rotation (visible at sunset/night)
    if (this.headlightGfx && this.rover) {
      this.headlightGfx.setPosition(this.rover.x, this.rover.y)
      this.headlightGfx.setRotation(this.rover.rotation)
      const isNight = store.timeLeft <= SUNSET_WARN_SEC || store.dayPhase === 'ended'
      this.headlightGfx.setVisible(isNight)
    }

    // Update full-screen tint overlays (sunset glow, night darkness, storm haze)
    this.updateTintOverlays()

    const distToBase = Phaser.Math.Distance.Between(this.rover.x, this.rover.y, BASE_X, BASE_Y)

    if (isPoweredOff || isControlsLocked || dayPhase === 'ended' || dayPhase === 'morning') {
      this.roverBody.setVelocity(0, 0)
      if (this.dustEmitter && this.dustEmitter.emitting) this.dustEmitter.stop()
      // Flush accumulated timers and report idle driving/position
      if (this.accumulatedTimerDt > 0) {
        store.tickDayTimer(this.accumulatedTimerDt)
        this.accumulatedTimerDt = 0
      }
      if (this.accumulatedScanDt > 0) {
        store.tickScan(this.accumulatedScanDt)
        this.accumulatedScanDt = 0
      }
      if (this.lastReportedDriving !== false) {
        this.lastReportedDriving = false
        store.setIsDriving(false)
      }
      store.setRoverPos(this.rover.x, this.rover.y)
      this.updateBaseVisuals(store, distToBase, false)
      this.updateShieldBubble(dt, distToBase, store, _time)
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
      this.accumulatedDistance += stepDist

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

    const dist = Phaser.Math.Distance.Between(this.rover.x, this.rover.y, BASE_X, BASE_Y)
    this.updateBaseVisuals(store, dist, driving)
    this.updateShieldBubble(dt, dist, store, _time)

    // Local battery physics at full 60 Hz (never read from store to avoid lag)
    if (driving) {
      const drainRate = BATTERY_DRAIN_DRIVING * planetConfig.batteryDrainMultiplier
      this.localBattery -= drainRate * dt
    } else if (dist < BASE_SAFE_DISTANCE) {
      this.localBattery += BATTERY_RECHARGE_BASE * dt
    }
    this.localBattery = Phaser.Math.Clamp(this.localBattery, 0, store.batteryCapacity)

    if (this.localBattery <= 0 && !isPoweredOff) {
      store.setIsPoweredOff(true)
    }

    // ── 10 Hz HUD flush (100 ms) ─────────────────────────────────────────────
    this.hudThrottleTimer += dt
    if (this.hudThrottleTimer >= 0.1) {
      this.hudThrottleTimer = 0

      if (this.accumulatedTimerDt > 0) {
        store.tickDayTimer(this.accumulatedTimerDt)
        this.accumulatedTimerDt = 0
      }
      if (this.accumulatedScanDt > 0) {
        store.tickScan(this.accumulatedScanDt)
        this.accumulatedScanDt = 0
      }
      if (this.accumulatedDistance > 0) {
        store.addDistanceDriven(this.accumulatedDistance)
        this.accumulatedDistance = 0
      }
      if (this.lastReportedDriving !== driving) {
        this.lastReportedDriving = driving
        store.setIsDriving(driving)
      }
      const roundedBat = Math.round(this.localBattery * 10) / 10
      if (Math.abs(roundedBat - this.lastReportedBattery) >= 0.1) {
        this.lastReportedBattery = roundedBat
        store.setBattery(roundedBat)
      }
      const rx = Math.round(this.rover.x)
      const ry = Math.round(this.rover.y)
      if (Math.hypot(rx - this.lastReportedRoverX, ry - this.lastReportedRoverY) >= 2) {
        this.lastReportedRoverX = rx
        this.lastReportedRoverY = ry
        store.setRoverPos(rx, ry)
      }
    }

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

  /**
   * Renders all full-screen tint overlays (sunset glow, night darkness, storm haze):
   * Sized to (cam.width / cam.zoom) * 2.5 x (cam.height / cam.zoom) * 2.5 and centered on the camera center.
   * With scrollFactor(0), the oversized rectangle extends far beyond the screen on all sides at any zoom level,
   * guaranteeing no borders, gaps, or box edges ever appear.
   * Placed at depth 15 so shield ring (20), base lights (21), and labels (22) stay above with additive glow.
   */
  private updateTintOverlays() {
    if (!this.darknessOverlayGfx || !this.cameras || !this.cameras.main) return

    const store = useGameStore.getState()
    const cam = this.cameras.main
    const z = cam.zoom || 1

    // Size overlay to (width / zoom) * 2.5 centered on camera center
    const padFactor = 2.5
    const spanW = (cam.width / z) * padFactor
    const spanH = (cam.height / z) * padFactor
    const startX = cam.width * 0.5 - spanW * 0.5
    const startY = cam.height * 0.5 - spanH * 0.5

    this.darknessOverlayGfx.clear()

    const isNight = store.timeLeft <= SUNSET_WARN_SEC || store.dayPhase === 'ended'
    const isMars = store.planet === 'mars'
    const stormState = store.stormState

    // 1. Warm Martian Sunset Glow (Mars only, no atmosphere/dust on Moon)
    if (isMars && isNight) {
      const progress =
        store.dayPhase === 'ended'
          ? 1
          : Math.max(0, Math.min(1, (SUNSET_WARN_SEC - store.timeLeft) / SUNSET_WARN_SEC))

      const orangeOpacity =
        progress < 0.5
          ? progress * 0.9 // 0 -> 0.45
          : (1 - progress) * 0.9 // 0.45 -> 0

      if (orangeOpacity > 0.01) {
        this.darknessOverlayGfx.fillStyle(0xc2410c, orangeOpacity * 0.5)
        this.darknessOverlayGfx.fillRect(startX, startY, spanW, spanH)
      }
    }

    // 2. Active Storm Radiation / Dust Haze
    if (stormState === 'active') {
      const stormLevel = store.stormLevelToday || 'minor'
      const hazeAlpha = stormLevel === 'strong' ? 0.22 : 0.14
      // Subtle red-orange storm atmosphere haze
      this.darknessOverlayGfx.fillStyle(0xdc2626, hazeAlpha)
      this.darknessOverlayGfx.fillRect(startX, startY, spanW, spanH)
      this.darknessOverlayGfx.fillStyle(0xd97706, hazeAlpha * 0.5)
      this.darknessOverlayGfx.fillRect(startX, startY, spanW, spanH)
    }

    // 3. Sunset / Night Darkness
    if (isNight) {
      const progress =
        store.dayPhase === 'ended'
          ? 1
          : Math.max(0, Math.min(1, (SUNSET_WARN_SEC - store.timeLeft) / SUNSET_WARN_SEC))

      const nightOpacity = progress * (isMars ? 0.82 : 0.90)
      const darkColor = isMars ? 0x060b1c : 0x000000

      if (nightOpacity > 0.01) {
        this.darknessOverlayGfx.fillStyle(darkColor, nightOpacity)
        this.darknessOverlayGfx.fillRect(startX, startY, spanW, spanH)
      }
    }
  }

  /**
   * Updates Habitat Outpost dynamic features:
   * - Windows glow warm yellow/amber at sunset/night, dim during day.
   * - Solar panels dim when dark.
   * - Pulsing green bolt floats above pad when rover is parked and charging.
   */
  private updateBaseVisuals(store: any, dist: number, driving: boolean) {
    if (!this.baseContainer) return

    const isNight = store.timeLeft <= SUNSET_WARN_SEC || store.dayPhase === 'ended'
    const isCharging =
      dist <= BASE_SAFE_DISTANCE &&
      !driving &&
      !store.isPoweredOff &&
      store.battery < store.batteryCapacity

    // 1. Windows on dome & pods
    if (this.baseWindowsGfx) {
      this.baseWindowsGfx.clear()
      if (isNight) {
        // Outer amber glow
        this.baseWindowsGfx.fillStyle(0xf59e0b, 0.45)
        this.baseWindowsGfx.fillCircle(0, -52, 9)
        this.baseWindowsGfx.fillRoundedRect(-60, -43, 14, 8, 2)
        this.baseWindowsGfx.fillRoundedRect(46, -43, 14, 8, 2)
        // Core bright warm yellow
        this.baseWindowsGfx.fillStyle(0xfef08a, 0.95)
        this.baseWindowsGfx.fillCircle(0, -52, 6)
        this.baseWindowsGfx.fillRoundedRect(-58, -41, 10, 5, 2)
        this.baseWindowsGfx.fillRoundedRect(48, -41, 10, 5, 2)
      } else {
        // Dim daytime glass
        this.baseWindowsGfx.fillStyle(0x1e293b, 0.85)
        this.baseWindowsGfx.fillCircle(0, -52, 6)
        this.baseWindowsGfx.fillRoundedRect(-58, -41, 10, 5, 2)
        this.baseWindowsGfx.fillRoundedRect(48, -41, 10, 5, 2)
      }
    }

    // 2. Solar panels dimming at night / low light
    if (this.solarPanelsDimGfx) {
      this.solarPanelsDimGfx.clear()
      if (isNight) {
        this.solarPanelsDimGfx.fillStyle(0x000000, 0.65)
        this.solarPanelsDimGfx.fillRoundedRect(-126, -52 - 28, 40, 56, 4)
        this.solarPanelsDimGfx.fillRoundedRect(86, -52 - 28, 40, 56, 4)
      }
    }

    // 3. Charging green bolt indicator
    if (this.chargingBoltText) {
      this.chargingBoltText.setVisible(isCharging)
    }
  }

  /**
   * Updates 150m Shield Bubble:
   * - Depth 20 & ADD blend mode so it glows brightly at night (+40% glow boost).
   * - Breathing pulse (1.0 to 1.05) & expanding ripple pool every 1.5s - 3.0s.
   * - Fast pulsing during storm countdown warning (2.2x speed).
   * - 300ms bounce & green/orange rim flash on entering/leaving shelter boundary.
   * - Crisp vector pill label at depth 22, inverted camera zoom, clamped inside screen view.
   */
  private updateShieldBubble(dt: number, dist: number, store: any, time: number) {
    if (!this.shieldContainer) return

    const shieldStrength = store.shieldToday ?? 100
    const isInside = dist <= BASE_SAFE_DISTANCE
    const stormState = store.stormState // 'idle' | 'warning' | 'active'
    const stormLevel = (store.stormLevelToday || 'none') as 'none' | 'minor' | 'strong'
    const stormPower = STORM_STRENGTHS[stormLevel] || 0
    const isStormActive = stormState === 'active'
    const shieldWeaker = isStormActive && shieldStrength < stormPower
    const isNight = store.timeLeft <= SUNSET_WARN_SEC || store.dayPhase === 'ended'
    const nightBoost = isNight ? 1.4 : 1.0

    // 1. Storm Countdown Speedup (2.2x pulse)
    const speedMult = stormState === 'warning' ? 2.2 : 1.0
    if (this.shieldTween) {
      this.shieldTween.setTimeScale(speedMult)
    }
    if (this.shieldAlphaTween) {
      this.shieldAlphaTween.setTimeScale(speedMult)
    }

    // 2. Boundary Transition Bounce (scale to 1.12 over 300ms) & Rim Flash
    if (this.prevRoverSheltered !== null && isInside !== this.prevRoverSheltered) {
      const isEntering = isInside
      this.shieldFlashColor = isEntering ? 0x22c55e : 0xf97316
      this.shieldFlashAlpha = 1.0

      // Quick 300ms bounce on shieldContainer (yoyo 150ms + 150ms)
      this.tweens.killTweensOf(this.shieldContainer)
      this.tweens.add({
        targets: this.shieldContainer,
        scaleX: { from: 1.0, to: 1.12 },
        scaleY: { from: 1.0, to: 1.12 },
        yoyo: true,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.shieldContainer.setScale(1.0, 1.0)
        },
      })
    }
    this.prevRoverSheltered = isInside

    if (this.shieldFlashAlpha > 0) {
      this.shieldFlashAlpha = Math.max(0, this.shieldFlashAlpha - dt * 3.2)
    }

    // 3. Rotate dashed rim outline
    if (this.shieldDashedGfx) {
      this.shieldDashedGfx.angle += dt * 14
    }

    // 4. Resolve Bubble Colors and Opacities
    let baseColor = 0x38bdf8 // cyan-blue default
    let statusText = `Shield ${shieldStrength}%`
    let textColor = '#38bdf8'
    let borderColor = 0x38bdf8

    if (isStormActive) {
      if (shieldWeaker) {
        baseColor = 0xef4444 // red/orange if storm overpowers shield
        borderColor = 0xef4444
        textColor = '#f87171'
      } else {
        baseColor = 0x38bdf8
        borderColor = 0x38bdf8
        textColor = '#38bdf8'
      }
      if (!isInside) {
        statusText = `EXPOSED! · Shield ${shieldStrength}%`
        borderColor = 0xef4444
        textColor = '#f87171'
      } else {
        statusText = `SAFE · Shield ${shieldStrength}%`
        borderColor = 0x22c55e
        textColor = '#4ade80'
      }
    } else if (isInside) {
      baseColor = 0x22c55e // green when rover inside
      borderColor = 0x22c55e
      textColor = '#4ade80'
      statusText = `SAFE · Shield ${shieldStrength}%`
    }

    const strengthRatio = Math.max(0, Math.min(100, shieldStrength)) / 100
    const fillAlpha = Math.max(0.015, 0.08 * strengthRatio) * nightBoost
    const rimAlpha = Math.min(1.0, (shieldStrength === 0 ? 0.18 : 0.38 + 0.62 * strengthRatio) * nightBoost)
    const outerAlpha = Math.min(0.8, rimAlpha * 0.45)

    // Active storm flicker jitter
    const jitter = isStormActive
      ? shieldWeaker
        ? 0.75 + Math.random() * 0.45
        : 0.9 + Math.random() * 0.2
      : 1.0

    // Redraw Fill
    this.shieldFillGfx.clear()
    this.shieldFillGfx.fillStyle(baseColor, Math.min(0.25, fillAlpha * jitter))
    this.shieldFillGfx.fillCircle(0, 0, BASE_SAFE_DISTANCE)

    // Redraw Rim & Outer Glow (ADD blend mode)
    this.shieldOuterGlowGfx.clear()
    this.shieldOuterGlowGfx.lineStyle(8, baseColor, outerAlpha * jitter)
    this.shieldOuterGlowGfx.strokeCircle(0, 0, BASE_SAFE_DISTANCE + 2)

    this.shieldRimGfx.clear()
    const rimThickness = shieldStrength === 0 ? 1.5 : Math.max(2, 2 + strengthRatio * 2.5)
    this.shieldRimGfx.lineStyle(rimThickness, baseColor, Math.min(1.0, rimAlpha * jitter))
    this.shieldRimGfx.strokeCircle(0, 0, BASE_SAFE_DISTANCE)

    // Rim flash on enter/exit
    if (this.shieldFlashAlpha > 0) {
      this.shieldRimGfx.lineStyle(5, this.shieldFlashColor, this.shieldFlashAlpha * 0.9)
      this.shieldRimGfx.strokeCircle(0, 0, BASE_SAFE_DISTANCE)
    }

    // Redraw Dashed Rim
    this.shieldDashedGfx.clear()
    const dashCount = 28
    const dashAngle = (Math.PI * 2) / dashCount
    this.shieldDashedGfx.lineStyle(1.8, baseColor, rimAlpha * 0.65 * jitter)
    for (let i = 0; i < dashCount; i += 2) {
      const a1 = i * dashAngle
      const a2 = (i + 1) * dashAngle
      this.shieldDashedGfx.beginPath()
      this.shieldDashedGfx.arc(0, 0, BASE_SAFE_DISTANCE, a1, a2, false)
      this.shieldDashedGfx.strokePath()
    }

    // Active Storm Ripples / Sparks
    this.shieldRipplesGfx.clear()
    if (isStormActive) {
      const ripplePhase = (time % 1200) / 1200
      const r1 = BASE_SAFE_DISTANCE - 12 + ripplePhase * 24
      const r2 = BASE_SAFE_DISTANCE + 10 - ripplePhase * 20
      this.shieldRipplesGfx.lineStyle(2.5, baseColor, (1 - ripplePhase) * 0.6 * nightBoost)
      this.shieldRipplesGfx.strokeCircle(0, 0, r1)
      this.shieldRipplesGfx.lineStyle(1.5, 0xffffff, (1 - ripplePhase) * 0.5 * nightBoost)
      this.shieldRipplesGfx.strokeCircle(0, 0, r2)
    }

    // 5. Expanding Ripple Pool (Frequency based on shield strength: 1.5s to 3.0s)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      this.rippleTimer += dt
      const rippleInterval = 3.0 - 1.5 * strengthRatio
      if (this.rippleTimer >= rippleInterval && this.ripplePool.length > 0) {
        this.rippleTimer = 0
        const ripGfx = this.ripplePool.pop()!
        ripGfx.setVisible(true)
        this.activeRipples.push({
          gfx: ripGfx,
          elapsed: 0,
          duration: 1.3,
          maxAlpha: Math.max(0.15, 0.6 * strengthRatio),
          color: baseColor,
        })
      }
    }

    // Advance active ripples
    for (let i = this.activeRipples.length - 1; i >= 0; i--) {
      const rip = this.activeRipples[i]
      rip.elapsed += dt
      const progress = rip.elapsed / rip.duration
      if (progress >= 1) {
        rip.gfx.clear()
        rip.gfx.setVisible(false)
        this.ripplePool.push(rip.gfx)
        this.activeRipples.splice(i, 1)
      } else {
        rip.gfx.clear()
        const curR = BASE_SAFE_DISTANCE * (1 + 0.12 * progress)
        const curAlpha = rip.maxAlpha * (1 - progress) * nightBoost
        rip.gfx.lineStyle(2, rip.color, curAlpha)
        rip.gfx.strokeCircle(0, 0, curR)
      }
    }

    // 6. Shield Label (Crisp, vector shield icon, inverted zoom, screen clamped)
    if (this.shieldLabelContainer && this.shieldLabelText && this.shieldLabelPillGfx && this.shieldLabelIconGfx) {
      this.shieldLabelText.setText(statusText)
      this.shieldLabelText.setColor(textColor)

      const textWidth = this.shieldLabelText.width
      const iconSize = 14
      const iconPadding = 12
      const textPadding = 16
      const pillW = textWidth + iconSize + iconPadding + textPadding * 2
      const pillH = 34
      const pillR = 17

      // Center layout inside pill
      const contentStartX = -pillW / 2 + textPadding
      const iconCenterX = contentStartX + iconSize / 2
      const textStartX = contentStartX + iconSize + iconPadding

      this.shieldLabelText.setPosition(textStartX, 0)

      // Draw vector shield badge icon (no emoji)
      this.shieldLabelIconGfx.clear()
      this.shieldLabelIconGfx.fillStyle(borderColor, 1)
      this.shieldLabelIconGfx.beginPath()
      this.shieldLabelIconGfx.moveTo(iconCenterX - 6, -7)
      this.shieldLabelIconGfx.lineTo(iconCenterX + 6, -7)
      this.shieldLabelIconGfx.lineTo(iconCenterX + 6, 0)
      this.shieldLabelIconGfx.lineTo(iconCenterX, 8.5)
      this.shieldLabelIconGfx.lineTo(iconCenterX - 6, 0)
      this.shieldLabelIconGfx.closePath()
      this.shieldLabelIconGfx.fillPath()

      // Inner cut for shield icon
      this.shieldLabelIconGfx.fillStyle(0x0f172a, 0.85)
      this.shieldLabelIconGfx.beginPath()
      this.shieldLabelIconGfx.moveTo(iconCenterX - 3.5, -5)
      this.shieldLabelIconGfx.lineTo(iconCenterX + 3.5, -5)
      this.shieldLabelIconGfx.lineTo(iconCenterX + 3.5, -0.5)
      this.shieldLabelIconGfx.lineTo(iconCenterX, 5.5)
      this.shieldLabelIconGfx.lineTo(iconCenterX - 3.5, -0.5)
      this.shieldLabelIconGfx.closePath()
      this.shieldLabelIconGfx.fillPath()

      // Draw dark rounded pill background
      this.shieldLabelPillGfx.clear()
      this.shieldLabelPillGfx.fillStyle(0x0f172a, 0.85)
      this.shieldLabelPillGfx.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, pillR)
      this.shieldLabelPillGfx.lineStyle(2, borderColor, 1)
      this.shieldLabelPillGfx.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, pillR)

      // Invert camera zoom so label stays identical size on screen
      const cam = this.cameras.main
      const invZoom = 1 / cam.zoom
      this.shieldLabelContainer.setScale(invZoom)

      // Target world position: just above the top rim of the shield ring
      const targetWorldX = BASE_X
      const targetWorldY = BASE_Y - BASE_SAFE_DISTANCE - 26 * invZoom

      // Clamp label position so it stays inside camera viewport
      const marginX = (pillW / 2 + 12) * invZoom
      const marginY = (pillH / 2 + 12) * invZoom
      const clampedX = Phaser.Math.Clamp(
        targetWorldX,
        cam.worldView.x + marginX,
        cam.worldView.right - marginX
      )
      const clampedY = Phaser.Math.Clamp(
        targetWorldY,
        cam.worldView.y + marginY,
        cam.worldView.bottom - marginY
      )

      this.shieldLabelContainer.setPosition(clampedX, clampedY)
    }
  }
}
