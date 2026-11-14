import Phaser from 'phaser'
import { debugLogger } from './debugLogger'

export function buildMoonGroundTexture(textures: Phaser.Textures.TextureManager): string {
  const TEX_KEY = 'moon_ground_tile'
  const TEX_SIZE = 256

  if (textures.exists(TEX_KEY)) return TEX_KEY

  const canvas = document.createElement('canvas')
  canvas.width = TEX_SIZE
  canvas.height = TEX_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return TEX_KEY

  ctx.fillStyle = '#8a8a8a'
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)

  let seed = 0xdeadbeef
  const rng = () => {
    seed = (Math.imul(seed, 0x41c64e6d) + 0x6073) >>> 0
    return seed / 0xffffffff
  }

  const patchCount = 180
  for (let i = 0; i < patchCount; i++) {
    const x = rng() * TEX_SIZE
    const y = rng() * TEX_SIZE
    const rx = 8 + rng() * 36
    const ry = 6 + rng() * 24
    const lighter = rng() > 0.5
    ctx.fillStyle = lighter ? 'rgba(158,158,158,0.18)' : 'rgba(80,80,80,0.18)'
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const speckleCount = 500
  for (let i = 0; i < speckleCount; i++) {
    const sx = rng() * TEX_SIZE
    const sy = rng() * TEX_SIZE
    const r = 0.5 + rng() * 1.5
    const bright = rng() > 0.5
    ctx.fillStyle = bright ? 'rgba(176,176,176,0.55)' : 'rgba(100,100,100,0.55)'
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  try {
    textures.addCanvas(TEX_KEY, canvas)
  } catch (err) {
    console.warn('[TextureGen] addCanvas failed for moon ground, falling back to addImage:', err)
    // @ts-ignore
    textures.addImage(TEX_KEY, canvas)
  }
  debugLogger.recordTexture(TEX_KEY, TEX_SIZE, TEX_SIZE)
  return TEX_KEY
}

export function generateBaseTexture(textures: Phaser.Textures.TextureManager, isMoon: boolean): string {
  const key = isMoon ? 'outpost_base_moon' : 'outpost_base_mars'
  if (textures.exists(key)) return key

  const canvas = document.createElement('canvas')
  const W = 320
  const H = 280
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return key

  const cx = 160
  const cy = 140

  const shadowColor = isMoon ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.32)'
  const sox = 14
  const soy = 16
  ctx.fillStyle = shadowColor

  ctx.beginPath()
  ctx.arc(cx + sox, cy + soy, 48, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx + sox, cy - 52 + soy, 40, 0, Math.PI * 2)
  ctx.fill()

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  roundRect(cx - 96 + sox, cy - 44 + soy, 36, 44, 10)
  ctx.fill()
  roundRect(cx + 60 + sox, cy - 44 + soy, 36, 44, 10)
  ctx.fill()

  // Landing pad
  const padGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 48)
  padGrad.addColorStop(0, isMoon ? '#475569' : '#57534e')
  padGrad.addColorStop(0.85, isMoon ? '#334155' : '#44403c')
  padGrad.addColorStop(1, isMoon ? '#1e293b' : '#292524')
  ctx.fillStyle = padGrad
  ctx.beginPath()
  ctx.arc(cx, cy, 48, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#eab308'
  ctx.stroke()

  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'
  ctx.beginPath()
  ctx.arc(cx, cy, 38, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - 16, cy - 18)
  ctx.lineTo(cx - 16, cy + 18)
  ctx.moveTo(cx + 16, cy - 18)
  ctx.lineTo(cx + 16, cy + 18)
  ctx.moveTo(cx - 16, cy)
  ctx.lineTo(cx + 16, cy)
  ctx.stroke()
  ctx.lineCap = 'butt'

  // Central Dome
  const domeGrad = ctx.createRadialGradient(cx - 10, cy - 60, 4, cx, cy - 52, 38)
  domeGrad.addColorStop(0, '#ffffff')
  domeGrad.addColorStop(0.35, isMoon ? '#f1f5f9' : '#ffedd5')
  domeGrad.addColorStop(0.75, isMoon ? '#cbd5e1' : '#fed7aa')
  domeGrad.addColorStop(1, isMoon ? '#94a3b8' : '#fb923c')
  ctx.fillStyle = domeGrad
  ctx.beginPath()
  ctx.arc(cx, cy - 52, 38, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = isMoon ? '#64748b' : '#ea580c'
  ctx.stroke()

  // Habitat Pods
  const podGradLeft = ctx.createLinearGradient(cx - 96, cy - 44, cx - 60, cy)
  podGradLeft.addColorStop(0, '#ffffff')
  podGradLeft.addColorStop(0.7, isMoon ? '#cbd5e1' : '#fed7aa')
  podGradLeft.addColorStop(1, isMoon ? '#94a3b8' : '#f97316')
  ctx.fillStyle = podGradLeft
  roundRect(cx - 96, cy - 44, 36, 44, 10)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = isMoon ? '#64748b' : '#c2410c'
  ctx.stroke()

  const podGradRight = ctx.createLinearGradient(cx + 60, cy - 44, cx + 96, cy)
  podGradRight.addColorStop(0, '#ffffff')
  podGradRight.addColorStop(0.7, isMoon ? '#cbd5e1' : '#fed7aa')
  podGradRight.addColorStop(1, isMoon ? '#94a3b8' : '#f97316')
  ctx.fillStyle = podGradRight
  roundRect(cx + 60, cy - 44, 36, 44, 10)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = isMoon ? '#64748b' : '#c2410c'
  ctx.stroke()

  // Connecting corridors
  ctx.fillStyle = isMoon ? '#94a3b8' : '#c2410c'
  ctx.fillRect(cx - 62, cy - 58, 26, 12)
  ctx.fillRect(cx + 36, cy - 58, 26, 12)
  ctx.fillRect(cx - 7, cy - 16, 14, 16)

  // Solar Panels
  const drawSolarArray = (ax: number, ay: number) => {
    ctx.fillStyle = isMoon ? '#475569' : '#78716c'
    ctx.fillRect(ax + 18, ay + 6, 8, 38)
    ctx.fillStyle = '#0f172a'
    roundRect(ax - 2, ay, 48, 50, 4)
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#38bdf8'
    ctx.stroke()
    ctx.fillStyle = '#1e3a8a'
    ctx.fillRect(ax + 2, ay + 4, 20, 20)
    ctx.fillRect(ax + 26, ay + 4, 20, 20)
    ctx.fillRect(ax + 2, ay + 26, 20, 20)
    ctx.fillRect(ax + 26, ay + 26, 20, 20)
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)'
    ctx.beginPath()
    ctx.moveTo(ax + 12, ay + 4)
    ctx.lineTo(ax + 12, ay + 46)
    ctx.moveTo(ax + 36, ay + 4)
    ctx.lineTo(ax + 36, ay + 46)
    ctx.moveTo(ax + 2, ay + 14)
    ctx.lineTo(ax + 46, ay + 14)
    ctx.moveTo(ax + 2, ay + 36)
    ctx.lineTo(ax + 46, ay + 36)
    ctx.stroke()
  }

  drawSolarArray(cx - 150, cy - 48)
  drawSolarArray(cx + 104, cy - 48)

  // Antenna
  ctx.strokeStyle = isMoon ? '#94a3b8' : '#cbd5e1'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx + 20, cy - 60)
  ctx.lineTo(cx + 24, cy - 88)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#38bdf8'
  ctx.beginPath()
  ctx.arc(cx + 24, cy - 84, 6, -Math.PI / 2, Math.PI / 2)
  ctx.stroke()

  try {
    textures.addCanvas(key, canvas)
  } catch (err) {
    console.warn('[TextureGen] addCanvas failed for base, falling back to addImage:', err)
    // @ts-ignore
    textures.addImage(key, canvas)
  }
  debugLogger.recordTexture(key, W, H)
  return key
}

export function generateRoverTexture(textures: Phaser.Textures.TextureManager): string {
  const key = 'pro_rover'
  if (textures.exists(key)) return key

  const canvas = document.createElement('canvas')
  const W = 84
  const H = 56
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return key

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const drawWheel = (wx: number, wy: number) => {
    ctx.fillStyle = '#1e293b'
    roundRect(wx, wy, 20, 11, 3)
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = '#64748b'
    ctx.stroke()
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(wx + 6, wy)
    ctx.lineTo(wx + 6, wy + 11)
    ctx.moveTo(wx + 10, wy)
    ctx.lineTo(wx + 10, wy + 11)
    ctx.moveTo(wx + 14, wy)
    ctx.lineTo(wx + 14, wy + 11)
    ctx.stroke()
    ctx.fillStyle = '#94a3b8'
    ctx.beginPath()
    ctx.arc(wx + 10, wy + 5.5, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  drawWheel(8, 2)
  drawWheel(56, 2)
  drawWheel(8, 43)
  drawWheel(56, 43)

  // Chassis
  const bodyGrad = ctx.createLinearGradient(12, 10, 72, 46)
  bodyGrad.addColorStop(0, '#f8fafc')
  bodyGrad.addColorStop(0.5, '#e2e8f0')
  bodyGrad.addColorStop(1, '#94a3b8')
  ctx.fillStyle = bodyGrad
  roundRect(14, 10, 56, 36, 8)
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#64748b'
  ctx.stroke()

  // Solar deck
  ctx.fillStyle = '#1e3a8a'
  roundRect(18, 14, 18, 28, 3)
  ctx.fill()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1
  ctx.stroke()

  // Cab
  const cabGrad = ctx.createLinearGradient(40, 16, 64, 40)
  cabGrad.addColorStop(0, '#38bdf8')
  cabGrad.addColorStop(0.5, '#0284c7')
  cabGrad.addColorStop(1, '#0c4a6e')
  ctx.fillStyle = cabGrad
  roundRect(40, 16, 24, 24, 6)
  ctx.fill()
  ctx.strokeStyle = '#7dd3fc'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Headlights
  ctx.fillStyle = '#fef08a'
  ctx.beginPath()
  ctx.arc(68, 17, 3.5, 0, Math.PI * 2)
  ctx.arc(68, 39, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#eab308'
  ctx.lineWidth = 1
  ctx.stroke()

  try {
    textures.addCanvas(key, canvas)
  } catch (err) {
    console.warn('[TextureGen] addCanvas failed for rover, falling back to addImage:', err)
    // @ts-ignore
    textures.addImage(key, canvas)
  }
  debugLogger.recordTexture(key, W, H)
  return key
}

export function generateDustParticleTexture(textures: Phaser.Textures.TextureManager): string {
  const dustKey = 'dust_particle'
  if (textures.exists(dustKey)) return dustKey

  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#d97736'
    ctx.beginPath()
    ctx.arc(4, 4, 4, 0, Math.PI * 2)
    ctx.fill()
    try {
      textures.addCanvas(dustKey, canvas)
    } catch {
      // @ts-ignore
      textures.addImage(dustKey, canvas)
    }
  }
  return dustKey
}
