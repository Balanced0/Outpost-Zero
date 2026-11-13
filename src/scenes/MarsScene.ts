import Phaser from 'phaser'
import { useGameStore } from '../store/gameStore'

const MAP_W = 4000
const MAP_H = 4000
const TILE_SIZE = 64
const BASE_X = 2000
const BASE_Y = 2000
const ROVER_SPEED = 180
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
  private rng!: Phaser.Math.RandomDataGenerator
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter

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

    // ---- 5. ROVER ----
    this.createRover(checkFailed)

    // ---- 6. DUST PARTICLES ----
    this.createDustParticles()

    // ---- 7. CAMERA ----
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H)
    this.cameras.main.startFollow(this.rover as Phaser.GameObjects.GameObject, true, 0.08, 0.08)

    // ---- 8. INPUT ----
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // Reset rover listener (from HUD)
    const handleReset = () => {
      if (this.rover && this.roverBody) {
        this.rover.setPosition(BASE_X, BASE_Y)
        this.roverBody.reset(BASE_X, BASE_Y)
      }
    }
    window.addEventListener('reset-rover-to-base', handleReset)
    this.events.once('shutdown', () => {
      window.removeEventListener('reset-rover-to-base', handleReset)
    })
  }

  // ------------------------------------------------------------------ helpers

  private buildGround(checkFailed: (k: string) => boolean) {
    const cols = Math.ceil(MAP_W / TILE_SIZE)
    const rows = Math.ceil(MAP_H / TILE_SIZE)

    // Ground tile keys that exist (Mars red-orange: tile01..05, rocky: 06-08)
    const tileKeys: string[] = []
    for (let i = 1; i <= 8; i++) {
      const k = `tile${String(i).padStart(2,'0')}`
      if (!checkFailed(k)) tileKeys.push(k)
    }

    if (tileKeys.length === 0) {
      // Fallback: solid rectangle
      const bg = this.add.graphics()
      bg.fillStyle(0x8b3a0f)
      bg.fillRect(0, 0, MAP_W, MAP_H)
      return
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Weighted toward tile01-05 (Mars red-orange)
        const roll = this.rng.integerInRange(0, 9)
        let key: string
        if (roll < 7) {
          // 70% chance: one of the reddish tiles 01-05
          key = tileKeys[this.rng.integerInRange(0, Math.min(4, tileKeys.length - 1))]
        } else {
          // 30% chance: any tile
          key = tileKeys[this.rng.integerInRange(0, tileKeys.length - 1)]
        }
        this.add.image(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, key)
      }
    }
  }

  private drawCraters() {
    const gfx = this.add.graphics()
    const count = 40

    for (let i = 0; i < count; i++) {
      let x: number, y: number
      do {
        x = this.rng.integerInRange(60, MAP_W - 60)
        y = this.rng.integerInRange(60, MAP_H - 60)
      } while (Phaser.Math.Distance.Between(x, y, BASE_X, BASE_Y) < 200)

      const r = this.rng.integerInRange(20, 60)
      // Dark outer ring
      gfx.fillStyle(0x3d2b1f, 0.85)
      gfx.fillCircle(x, y, r)
      // Slightly lighter inner depression
      gfx.fillStyle(0x2a1a0f, 0.7)
      gfx.fillCircle(x, y, r * 0.65)
      // Rim highlight
      gfx.lineStyle(2, 0x5a3e2b, 0.6)
      gfx.strokeCircle(x, y, r)
    }
  }

  private scatterRocks(checkFailed: (k: string) => boolean) {
    const envKeys: string[] = []
    for (let i = 1; i <= 10; i++) {
      const k = `env${String(i).padStart(2,'0')}`
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
      } else {
        // Fallback: draw rock shape
        const gfx = this.add.graphics()
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
      // Solar panels suggestion
      gfx.fillStyle(0x2255aa, 0.8)
      gfx.fillRect(BASE_X - 60, BASE_Y - 10, 20, 20)
      gfx.fillRect(BASE_X + 40, BASE_Y - 10, 20, 20)
    }
  }

  private createRover(checkFailed: (k: string) => boolean) {
    if (!checkFailed('rover')) {
      const img = this.add.image(BASE_X, BASE_Y, 'rover')
      // Scale so the rover is ~48px wide
      const tex = this.textures.get('rover').getSourceImage()
      const scaleX = 48 / tex.width
      img.setScale(scaleX)
      img.setDepth(20)
      this.physics.add.existing(img)
      this.rover = img
    } else {
      // Fallback: draw rounded rect rover
      const rt = this.add.renderTexture(0, 0, 54, 36)
      const g = this.make.graphics({ x: 0, y: 0 })
      g.setVisible(false)
      // Body
      g.fillStyle(0xe07020, 1)
      g.fillRoundedRect(4, 6, 46, 24, 6)
      // Wheels
      g.fillStyle(0x555555, 1)
      g.fillRect(2, 6, 10, 8)
      g.fillRect(2, 22, 10, 8)
      g.fillRect(42, 6, 10, 8)
      g.fillRect(42, 22, 10, 8)
      // Cockpit
      g.fillStyle(0x88ccff, 0.8)
      g.fillRect(20, 10, 14, 10)
      rt.draw(g, 0, 0)
      g.destroy()

      rt.setPosition(BASE_X, BASE_Y)
      rt.setDepth(20)
      rt.setOrigin(0.5, 0.5)
      this.physics.add.existing(rt)
      this.rover = rt
    }

    this.roverBody = (this.rover as unknown as { body: Phaser.Physics.Arcade.Body }).body
    this.roverBody.setCollideWorldBounds(true)
    this.roverBody.setMaxVelocity(ROVER_SPEED, ROVER_SPEED)
  }

  private createDustParticles() {
    // Particle using a graphics-generated texture
    if (!this.textures.exists('dust-particle')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.setVisible(false)
      g.fillStyle(0xc2956e, 1)
      g.fillCircle(4, 4, 4)
      g.generateTexture('dust-particle', 8, 8)
      g.destroy()
    }

    const particles = this.add.particles(BASE_X, BASE_Y, 'dust-particle', {
      lifespan: 600,
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      quantity: 2,
      frequency: 30,
      emitting: false,
      tint: 0xc2956e,
    })
    this.dustEmitter = particles
    this.dustEmitter.setDepth(15)
  }

  // ------------------------------------------------------------------ update

  update(_time: number, delta: number) {
    const store = useGameStore.getState()
    const { isPoweredOff, joystickDx, joystickDy } = store

    const dt = delta / 1000 // seconds

    if (isPoweredOff) {
      this.roverBody.setVelocity(0, 0)
      this.dustEmitter.stop()
      store.setIsDriving(false)
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

    // --- Dust particles ---
    if (driving) {
      const angle = Math.atan2(vy, vx)
      // Offset emission to the back of the rover
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
      battery -= 2 * dt
    } else if (dist < 150) {
      battery += 4 * dt
    }

    battery = Phaser.Math.Clamp(battery, 0, 100)
    store.setBattery(battery)

    if (battery <= 0) {
      store.setIsPoweredOff(true)
    }

    store.setRoverPos(this.rover.x, this.rover.y)
  }
}
