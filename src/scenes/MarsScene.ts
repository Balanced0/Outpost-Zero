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
import { DiscoverySpot } from '../data/discoverySpots'

const MAP_W = 4000
const MAP_H = 4000
const TILE_SIZE = 64
const MAP_SEED = 42

export default class MarsScene extends Phaser.Scene {
  private rover!: Phaser.GameObjects.Image | Phaser.GameObjects.RenderTexture
  private roverBody!: Phaser.Physics.Arcade.Body
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

  // Stage 6: Discoveries & Scanning Graphics
  private spotContainers: Map<string, Phaser.GameObjects.Container> = new Map()
  private scanGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('MarsScene')
  }

  create() {
    this.rng = new Phaser.Math.RandomDataGenerator([String(MAP_SEED)])

    // Track which textures failed
    const loader = this.textures
    const checkFailed = (key: string) => !loader.exists(key) || loader.get(key).key === '__MISSING'

    this.physics.world.setBounds(0, 0, MAP_W, MAP_H)

    // ---- 1. GROUND TILES ----
    this.buildGround(checkFailed)

    // ---- 2. CRATERS ----
    this.drawCraters()

    // ---- 3. ROCKS / ENVIRONMENT OBJECTS ----
    this.scatterRocks(checkFailed)

    // ---- 4. BASE ----
    this.placeBase(checkFailed)

    // ---- 5. DISCOVERY SPOTS (Stage 6) ----
    this.refreshDiscoverySpots()

    // ---- 6. ROVER ----
    this.createRover(checkFailed)

    // ---- 7. DUST PARTICLES ----
    this.createDustParticles()

    // ---- 8. SCAN GRAPHICS (Stage 6) ----
    this.scanGraphics = this.add.graphics()
    this.scanGraphics.setDepth(16)

    // ---- 9. CAMERA ----
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)
    this.cameras.main.startFollow(this.rover as Phaser.GameObjects.GameObject, true, 0.08, 0.08)

    // ---- 10. INPUT ----
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Reset rover listener (from HUD / morning / reset)
    const handleReset = () => {
      if (this.rover && this.roverBody) {
        this.rover.setPosition(BASE_X, BASE_Y)
        this.roverBody.reset(BASE_X, BASE_Y)
      }
      this.refreshDiscoverySpots()
    }
    window.addEventListener('reset-rover-to-base', handleReset)

    // Discovery collected listener
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
      window.removeEventListener('discovery-collected', handleCollected)
    })
  }

  // ------------------------------------------------------------------ helpers

  private buildGround(checkFailed: (k: string) => boolean) {
    const cols = Math.ceil(MAP_W / TILE_SIZE)
    const rows = Math.ceil(MAP_H / TILE_SIZE)

    // Ground tile keys that exist (Mars red-orange: tile01..05, rocky: 06-08)
    const tileKeys: string[] = []
    for (let i = 1; i <= 8; i++) {
      const k = `tile${String(i).padStart(2, '0')}`
      if (!checkFailed(k)) tileKeys.push(k)
    }

    if (tileKeys.length === 0) {
      // Fallback: procedural canvas / graphics
      const gfx = this.add.graphics()
      gfx.fillStyle(0x9a3d1e, 1)
      gfx.fillRect(0, 0, MAP_W, MAP_H)
      return
    }

    // Paint the world using an RenderTexture for speed (1 single draw call)
    const rt = this.add.renderTexture(0, 0, MAP_W, MAP_H)
    rt.setOrigin(0, 0)
    rt.setDepth(0)

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const key = tileKeys[this.rng.integerInRange(0, tileKeys.length - 1)]
        rt.draw(key, c * TILE_SIZE, r * TILE_SIZE)
      }
    }
  }

  private drawCraters() {
    const craterGfx = this.add.graphics()
    craterGfx.setDepth(1)

    const craterCount = 50
    for (let i = 0; i < craterCount; i++) {
      const cx = this.rng.integerInRange(100, MAP_W - 100)
      const cy = this.rng.integerInRange(100, MAP_H - 100)
      const r = this.rng.integerInRange(24, 90)

      // Outer rim
      craterGfx.fillStyle(0x6e2810, 0.45)
      craterGfx.fillCircle(cx, cy, r + 6)

      // Inner crater floor (dark shadowed circle)
      craterGfx.fillStyle(0x2f1107, 0.85)
      craterGfx.fillCircle(cx, cy, r)

      // Shadow crescent
      craterGfx.fillStyle(0x180803, 0.9)
      craterGfx.fillCircle(cx + r * 0.2, cy + r * 0.2, r * 0.75)
    }
  }

  private scatterRocks(checkFailed: (k: string) => boolean) {
    const envKeys: string[] = []
    for (let i = 1; i <= 10; i++) {
      const k = `env${String(i).padStart(2, '0')}`
      if (!checkFailed(k)) envKeys.push(k)
    }

    const count = 200
    for (let i = 0; i < count; i++) {
      let x: number, y: number
      do {
        x = this.rng.integerInRange(32, MAP_W - 32)
        y = this.rng.integerInRange(32, MAP_H - 32)
      } while (Phaser.Math.Distance.Between(x, y, BASE_X, BASE_Y) < 300)

      if (envKeys.length > 0) {
        const key = envKeys[this.rng.integerInRange(0, envKeys.length - 1)]
        const scale = this.rng.realInRange(0.5, 1.2)
        const img = this.add.image(x, y, key)
        img.setScale(scale)
        img.setAlpha(this.rng.realInRange(0.75, 1.0))
        img.setDepth(2)
      } else {
        // Fallback: draw rock shape
        const gfx = this.add.graphics()
        gfx.setDepth(2)
        const rw = this.rng.integerInRange(12, 36)
        const rh = this.rng.integerInRange(8, 24)
        gfx.fillStyle(0x5a4030, 0.9)
        gfx.fillEllipse(x, y, rw, rh)
        gfx.fillStyle(0x7a5a40, 0.5)
        gfx.fillEllipse(x - rw * 0.15, y - rh * 0.2, rw * 0.5, rh * 0.4)
      }
    }
  }

  private placeBase(checkFailed: (k: string) => boolean) {
    if (!checkFailed('base')) {
      const baseSprite = this.add.image(BASE_X, BASE_Y, 'base')
      baseSprite.setDepth(10)
    } else {
      // Fallback: draw octagon
      const gfx = this.add.graphics()
      gfx.setDepth(10)
      const r = 48
      gfx.fillStyle(0x888888, 1)
      gfx.lineStyle(3, 0xaaaaaa, 1)
      const pts: Phaser.Types.Math.Vector2Like[] = []
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i - Math.PI / 8
        pts.push({ x: BASE_X + r * Math.cos(angle), y: BASE_Y + r * Math.sin(angle) })
      }
      gfx.fillPoints(pts, true)
      gfx.strokePoints(pts, true)

      // Dome
      gfx.fillStyle(0x4488aa, 0.85)
      gfx.fillCircle(BASE_X, BASE_Y, 24)
    }

    // Subtle base solar halo circle indicating charging area
    const halo = this.add.graphics()
    halo.setDepth(3)
    halo.lineStyle(2, 0x38bdf8, 0.4)
    halo.strokeCircle(BASE_X, BASE_Y, BASE_SAFE_DISTANCE)
  }

  // ------------------------------------------------------------------ Discovery Spots
  private refreshDiscoverySpots() {
    // Clear any existing containers
    this.spotContainers.forEach((c) => c.destroy())
    this.spotContainers.clear()

    const spots = useGameStore.getState().discoverySpots

    spots.forEach((spot) => {
      if (spot.collected) return

      const container = this.add.container(spot.x, spot.y)
      container.setDepth(8)

      // 1. Pulsing Glow Aura
      const aura = this.add.graphics()
      const auraColor =
        spot.type === 'rock' ? 0xf59e0b : spot.type === 'riverbed' ? 0xd97706 : 0x06b6d4
      const auraRadius = spot.type === 'rock' ? 30 : spot.type === 'riverbed' ? 36 : 42

      aura.fillStyle(auraColor, 0.28)
      aura.fillCircle(0, 0, auraRadius)
      aura.lineStyle(2, auraColor, 0.6)
      aura.strokeCircle(0, 0, auraRadius)
      container.add(aura)

      // Add gentle looping pulse tween
      this.tweens.add({
        targets: aura,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: { from: 0.3, to: 0.75 },
        yoyo: true,
        repeat: -1,
        duration: 1100 + (spot.x % 400),
        ease: 'Sine.easeInOut',
      })

      // 2. Distinct Visual Sprite / Graphic
      const graphic = this.add.graphics()
      if (spot.type === 'rock') {
        // Rock sample: Cluster of faceted Martian rocks with sparkling mineral flecks
        graphic.fillStyle(0x5c3218, 1)
        graphic.fillCircle(-6, -4, 12)
        graphic.fillStyle(0x7c4522, 1)
        graphic.fillCircle(6, 2, 14)
        graphic.fillStyle(0xa15d31, 1)
        graphic.fillCircle(0, 4, 10)
        // Highlight mineral specks
        graphic.fillStyle(0xfde047, 0.9)
        graphic.fillCircle(-4, -6, 2)
        graphic.fillCircle(7, 0, 2.5)
        graphic.fillCircle(1, 5, 2)
      } else if (spot.type === 'riverbed') {
        // Ancient riverbed: Wavy, striated desert mud/sediment bands
        graphic.fillStyle(0x78350f, 0.9)
        graphic.fillRoundedRect(-24, -14, 48, 28, 8)
        graphic.fillStyle(0xb45309, 0.95)
        graphic.fillRoundedRect(-20, -10, 40, 20, 6)
        graphic.fillStyle(0xd97706, 1)
        graphic.fillRoundedRect(-16, -6, 32, 12, 4)
        graphic.fillStyle(0xfef08a, 0.8)
        graphic.fillRect(-12, -2, 24, 4)
      } else {
        // Ice deposit: Blue-white crystalline ice patch (NO purple plants!)
        graphic.fillStyle(0x0284c7, 0.85)
        graphic.fillCircle(0, 0, 20)
        graphic.fillStyle(0x38bdf8, 0.9)
        graphic.fillCircle(-4, -2, 14)
        graphic.fillStyle(0xa5f3fc, 0.95)
        graphic.fillCircle(3, 3, 10)
        graphic.fillStyle(0xffffff, 1)
        graphic.fillCircle(0, 0, 5)

        // Crystalline facet spokes
        graphic.lineStyle(2, 0xffffff, 0.9)
        graphic.lineBetween(-16, 0, 16, 0)
        graphic.lineBetween(0, -16, 0, 16)
        graphic.lineBetween(-10, -10, 10, 10)
        graphic.lineBetween(-10, 10, 10, -10)
      }
      container.add(graphic)

      // 3. Floating Category Badge / Icon Text
      const iconChar = spot.type === 'rock' ? '🪨' : spot.type === 'riverbed' ? '〰️' : '❄️'
      const iconText = this.add.text(0, -28, iconChar, {
        fontSize: '16px',
      })
      iconText.setOrigin(0.5, 0.5)
      container.add(iconText)

      this.spotContainers.set(spot.id, container)
    })
  }

  private createRover(checkFailed: (k: string) => boolean) {
    if (!checkFailed('rover')) {
      this.rover = this.physics.add.image(BASE_X, BASE_Y, 'rover')
      this.rover.setScale(0.85)
    } else {
      // Fallback: procedural rover graphic
      const rCanvas = this.make.graphics()
      rCanvas.setVisible(false)
      rCanvas.fillStyle(0xeeeeee, 1)
      rCanvas.fillRoundedRect(0, 0, 48, 32, 6)
      rCanvas.fillStyle(0x333333, 1)
      rCanvas.fillRect(4, -4, 10, 8)
      rCanvas.fillRect(34, -4, 10, 8)
      rCanvas.fillRect(4, 28, 10, 8)
      rCanvas.fillRect(34, 28, 10, 8)
      rCanvas.fillStyle(0x38bdf8, 1)
      rCanvas.fillCircle(36, 16, 6)
      rCanvas.generateTexture('fallback_rover', 52, 36)

      this.rover = this.physics.add.image(BASE_X, BASE_Y, 'fallback_rover')
    }

    this.rover.setDepth(12)
    this.roverBody = this.rover.body as Phaser.Physics.Arcade.Body
    this.roverBody.setCollideWorldBounds(true)
    this.roverBody.setSize(36, 36)
  }

  private createDustParticles() {
    let dustKey = 'dust_particle'
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
    const { isPoweredOff, isControlsLocked, dayPhase, joystickDx, joystickDy, activeScan } = store

    const dt = delta / 1000 // seconds

    // Advance the day timer
    store.tickDayTimer(dt)

    // Tick active scan (Stage 6)
    if (activeScan) {
      store.tickScan(dt)
    }

    // Render Scanning Progress Ring around Rover
    this.renderScanRing(store.activeScan)

    if (isPoweredOff || isControlsLocked || dayPhase === 'ended' || dayPhase === 'morning') {
      this.roverBody.setVelocity(0, 0)
      this.dustEmitter.stop()
      store.setIsDriving(false)
      store.setRoverPos(this.rover.x, this.rover.y)
      return
    }

    // --- Movement ---
    let vx = 0
    let vy = 0

    // Keyboard
    const leftHeld = this.cursors.left.isDown || this.wasd.left.isDown
    const rightHeld = this.cursors.right.isDown || this.wasd.right.isDown
    const upHeld = this.cursors.up.isDown || this.wasd.up.isDown
    const downHeld = this.cursors.down.isDown || this.wasd.down.isDown

    if (leftHeld) vx -= ROVER_SPEED
    if (rightHeld) vx += ROVER_SPEED
    if (upHeld) vy -= ROVER_SPEED
    if (downHeld) vy += ROVER_SPEED

    // Joystick (normalized -1..1)
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

    // Rover rotation
    if (driving) {
      const angle = Math.atan2(vy, vx)
      this.rover.setRotation(angle)
    }

    // --- Dust particles & Distance tracking ---
    if (driving) {
      const stepDist = Math.sqrt(vx * vx + vy * vy) * dt
      store.addDistanceDriven(stepDist)

      const angle = Math.atan2(vy, vx)
      const offsetDist = 28
      const ex = this.rover.x - Math.cos(angle) * offsetDist
      const ey = this.rover.y - Math.sin(angle) * offsetDist
      this.dustEmitter.setPosition(ex, ey)
      if (!this.dustEmitter.emitting) this.dustEmitter.start()
    } else {
      if (this.dustEmitter.emitting) this.dustEmitter.stop()
    }

    // --- Store updates ---
    store.setIsDriving(driving)

    // Battery
    const dist = Phaser.Math.Distance.Between(this.rover.x, this.rover.y, BASE_X, BASE_Y)
    let battery = store.battery

    if (driving) {
      battery -= BATTERY_DRAIN_DRIVING * dt
    } else if (dist < BASE_SAFE_DISTANCE) {
      battery += BATTERY_RECHARGE_BASE * dt
    }

    battery = Phaser.Math.Clamp(battery, 0, store.batteryCapacity)
    store.setBattery(battery)

    if (battery <= 0 && !isPoweredOff) {
      store.setIsPoweredOff(true)
    }

    store.setRoverPos(this.rover.x, this.rover.y)

    // --- Proximity check for Discovery Spots (Stage 6) ---
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

    // --- Space key triggers scan ---
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
    const radius = 34
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
