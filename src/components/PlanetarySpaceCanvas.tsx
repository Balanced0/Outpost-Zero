import { useEffect, useRef } from 'react'
import { PlanetId } from '../config/planets'

interface PlanetarySpaceCanvasProps {
  selectedPlanet: PlanetId
  hoveredPlanet: PlanetId | null
}

interface Star {
  x: number
  y: number
  z: number
  size: number
  baseAlpha: number
  twinkleSpeed: number
  phase: number
  color: string
}

interface InteractiveNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

interface CursorParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface Comet {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  alpha: number
  color: string
}

/**
 * PlanetarySpaceCanvas — 60fps interactive deep-space motion-graphics canvas for the Home Screen.
 * Renders video-like rotating Mars & Moon globes, 3D tilted orbital rings, orbiting satellites,
 * solar plasma waves, shooting comets, constellation nodes that react to cursor proximity,
 * and a live cursor particle trail + targeting reticle.
 */
export function PlanetarySpaceCanvas({
  selectedPlanet,
  hoveredPlanet,
}: PlanetarySpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const activePlanetRef = useRef<PlanetId>(selectedPlanet)
  activePlanetRef.current = hoveredPlanet || selectedPlanet

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Preload planet textures for hybrid procedural + texture rendering
    const marsImg = new Image()
    marsImg.src = '/assets/menu/planet02.png'
    const moonImg = new Image()
    moonImg.src = '/assets/menu/planet05.png'

    // Mouse state
    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      active: false,
    }

    const cursorParticles: CursorParticle[] = []

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.active = true

      const isMars = activePlanetRef.current === 'mars'
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.4 + Math.random() * 1.6
        cursorParticles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 24 + Math.random() * 20,
          size: 1.8 + Math.random() * 2.5,
          color: isMars
            ? i % 2 === 0
              ? '#fb923c'
              : '#fde047'
            : i % 2 === 0
            ? '#22d3ee'
            : '#a5f3fc',
        })
      }
      if (cursorParticles.length > 90) {
        cursorParticles.splice(0, cursorParticles.length - 90)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // 160 multi-layer twinkling stars
    const starColors = ['#ffffff', '#fef08a', '#bae6fd', '#fed7aa', '#e0e7ff']
    const stars: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.2 + Math.random() * 0.8,
      size: 0.7 + Math.random() * 2.1,
      baseAlpha: 0.25 + Math.random() * 0.7,
      twinkleSpeed: 0.015 + Math.random() * 0.035,
      phase: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }))

    // 55 interactive orbital telemetry nodes that react to the cursor
    const nodes: InteractiveNode[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      radius: 1.4 + Math.random() * 1.8,
      color: Math.random() > 0.5 ? '#fb923c' : '#22d3ee',
    }))

    // Shooting comets
    const comets: Comet[] = []
    const spawnComet = () => {
      const isMars = activePlanetRef.current === 'mars'
      comets.push({
        x: Math.random() * width * 1.2 + width * 0.1,
        y: -30,
        vx: -(4.5 + Math.random() * 4),
        vy: 3.2 + Math.random() * 3,
        length: 80 + Math.random() * 70,
        alpha: 0.9,
        color: isMars ? '#fdba74' : '#67e8f9',
      })
    }
    spawnComet()

    // Smooth interpolation values for Mars vs Moon focus
    let marsFocus = activePlanetRef.current === 'mars' ? 1 : 0
    let frame = 0
    let rafId = 0

    const drawPlanetSystem = (
      cx: number,
      cy: number,
      radius: number,
      isMarsPlanet: boolean,
      focusWeight: number,
      t: number
    ) => {
      ctx.save()
      ctx.translate(cx, cy)

      // 1. Deep Atmospheric Outer Corona
      const glowRadius = radius * (1.85 + focusWeight * 0.35 + Math.sin(t * 2) * 0.06)
      const coronaGrad = ctx.createRadialGradient(0, 0, radius * 0.65, 0, 0, glowRadius)
      if (isMarsPlanet) {
        coronaGrad.addColorStop(0, `rgba(249, 115, 22, ${0.38 + focusWeight * 0.22})`)
        coronaGrad.addColorStop(0.45, `rgba(225, 29, 72, ${0.16 + focusWeight * 0.12})`)
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      } else {
        coronaGrad.addColorStop(0, `rgba(34, 211, 238, ${0.36 + focusWeight * 0.22})`)
        coronaGrad.addColorStop(0.45, `rgba(59, 130, 246, ${0.15 + focusWeight * 0.12})`)
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      }
      ctx.fillStyle = coronaGrad
      ctx.beginPath()
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2)
      ctx.fill()

      // 2. Back half of tilted 3D orbital rings
      const orbits = [
        { rx: radius * 1.48, ry: radius * 0.42, tilt: isMarsPlanet ? -0.38 : 0.35, speed: 0.7, color: isMarsPlanet ? '#fb923c' : '#22d3ee', sats: 3 },
        { rx: radius * 1.82, ry: radius * 0.56, tilt: isMarsPlanet ? 0.28 : -0.32, speed: -0.45, color: isMarsPlanet ? '#fde047' : '#a5f3fc', sats: 4 },
        { rx: radius * 2.15, ry: radius * 0.68, tilt: isMarsPlanet ? -0.15 : 0.18, speed: 0.3, color: '#ffffff', sats: 2 },
      ]

      orbits.forEach((orb, idx) => {
        ctx.save()
        ctx.rotate(orb.tilt)
        ctx.beginPath()
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, Math.PI, Math.PI * 2)
        ctx.strokeStyle = orb.color
        ctx.globalAlpha = (0.22 + focusWeight * 0.25) * (1 - idx * 0.2)
        ctx.lineWidth = idx === 0 ? 1.6 : 1
        ctx.setLineDash(idx === 1 ? [6, 8] : [])
        ctx.stroke()
        ctx.restore()
      })

      // 3. Planet Sphere Clipping & Base Gradient
      ctx.save()
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.clip()

      const sphereGrad = ctx.createRadialGradient(
        -radius * 0.32,
        -radius * 0.32,
        radius * 0.1,
        0,
        0,
        radius
      )
      if (isMarsPlanet) {
        sphereGrad.addColorStop(0, '#fed7aa')
        sphereGrad.addColorStop(0.3, '#f97316')
        sphereGrad.addColorStop(0.7, '#9a3412')
        sphereGrad.addColorStop(1, '#2a0a04')
      } else {
        sphereGrad.addColorStop(0, '#f8fafc')
        sphereGrad.addColorStop(0.35, '#cbd5e1')
        sphereGrad.addColorStop(0.72, '#475569')
        sphereGrad.addColorStop(1, '#0f172a')
      }
      ctx.fillStyle = sphereGrad
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2)

      // Overlay rotating planet sprite if loaded
      const img = isMarsPlanet ? marsImg : moonImg
      if (img.complete && img.naturalWidth > 0) {
        ctx.save()
        ctx.rotate(t * (isMarsPlanet ? 0.14 : -0.1))
        ctx.globalAlpha = 0.55
        ctx.drawImage(img, -radius * 1.04, -radius * 1.04, radius * 2.08, radius * 2.08)
        ctx.restore()
      }

      // Animated rotating procedural surface bands / craters + 3D longitude meridians
      const scrollOffset = (t * 28) % (radius * 2)
      ctx.save()
      ctx.globalAlpha = 0.32
      if (isMarsPlanet) {
        // Rotating Martian canyon bands & dust storms
        for (let b = -2; b <= 2; b++) {
          const by = b * (radius * 0.34)
          ctx.strokeStyle = b % 2 === 0 ? '#431407' : '#ffedd5'
          ctx.lineWidth = radius * 0.11
          ctx.lineCap = 'round'
          ctx.beginPath()
          const sx = -radius + scrollOffset + b * 18
          ctx.moveTo(sx - radius, by)
          ctx.quadraticCurveTo(sx - radius * 0.3, by - 12, sx + radius * 0.4, by + 6)
          ctx.stroke()
        }
        // Polar ice cap
        ctx.fillStyle = 'rgba(255, 247, 237, 0.55)'
        ctx.beginPath()
        ctx.ellipse(0, -radius * 0.86, radius * 0.48, radius * 0.15, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Rotating Lunar craters
        const craterSeeds = [
          { dx: -0.35, dy: -0.2, r: 0.22 },
          { dx: 0.25, dy: 0.15, r: 0.18 },
          { dx: -0.1, dy: 0.42, r: 0.14 },
          { dx: 0.4, dy: -0.35, r: 0.12 },
          { dx: -0.48, dy: 0.22, r: 0.15 },
        ]
        craterSeeds.forEach((c, i) => {
          const cxPos = ((c.dx * radius + t * 18 * (i % 2 === 0 ? 1 : -1)) % (radius * 1.4))
          const cyPos = c.dy * radius
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'
          ctx.beginPath()
          ctx.arc(cxPos, cyPos, c.r * radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)'
          ctx.lineWidth = 1.2
          ctx.stroke()
        })
      }

      // Rotating 3D Holographic Latitude / Longitude Wireframe Mesh
      ctx.strokeStyle = isMarsPlanet ? 'rgba(254, 215, 170, 0.28)' : 'rgba(165, 243, 252, 0.28)'
      ctx.lineWidth = 0.9
      for (let m = 0; m < 6; m++) {
        const phase = (t * 0.35 + (m * Math.PI) / 6) % Math.PI
        const rx = Math.abs(Math.cos(phase)) * radius
        ctx.beginPath()
        ctx.ellipse(0, 0, Math.max(1, rx), radius, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Day/Night Terminator & Specular Atmospheric Rim Light
      const terminatorGrad = ctx.createLinearGradient(-radius, -radius * 0.5, radius, radius * 0.7)
      terminatorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
      terminatorGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0)')
      terminatorGrad.addColorStop(0.82, 'rgba(2, 6, 23, 0.72)')
      terminatorGrad.addColorStop(1, 'rgba(2, 6, 23, 0.92)')
      ctx.fillStyle = terminatorGrad
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2)
      ctx.restore()

      // Crispy glowing atmospheric limb ring
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.strokeStyle = isMarsPlanet
        ? `rgba(251, 146, 60, ${0.55 + focusWeight * 0.35})`
        : `rgba(34, 211, 238, ${0.55 + focusWeight * 0.35})`
      ctx.lineWidth = 2 + focusWeight * 1.5
      ctx.stroke()

      // 4. Front half of tilted 3D orbital rings + Orbiting Satellites
      orbits.forEach((orb, idx) => {
        ctx.save()
        ctx.rotate(orb.tilt)
        ctx.beginPath()
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI)
        ctx.strokeStyle = orb.color
        ctx.globalAlpha = (0.45 + focusWeight * 0.38) * (1 - idx * 0.18)
        ctx.lineWidth = idx === 0 ? 1.8 : 1.1
        ctx.setLineDash(idx === 1 ? [6, 8] : [])
        ctx.stroke()

        // Draw orbiting satellites & recon probes along each ellipse
        for (let s = 0; s < orb.sats; s++) {
          const angle = t * orb.speed + (s * Math.PI * 2) / orb.sats + idx
          const sx = Math.cos(angle) * orb.rx
          const sy = Math.sin(angle) * orb.ry
          // Draw satellite trail arc
          ctx.beginPath()
          ctx.arc(sx, sy, idx === 0 ? 3.2 : 2.2, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.globalAlpha = 0.95
          ctx.fill()

          ctx.beginPath()
          ctx.arc(sx, sy, idx === 0 ? 8 : 5, 0, Math.PI * 2)
          ctx.fillStyle = orb.color
          ctx.globalAlpha = 0.35
          ctx.fill()
        }
        ctx.restore()
      })

      // 5. Rotating HUD Target Brackets Around Focused Planet
      if (focusWeight > 0.2) {
        ctx.save()
        ctx.rotate(-t * 0.2)
        ctx.strokeStyle = isMarsPlanet ? '#fb923c' : '#22d3ee'
        ctx.globalAlpha = focusWeight * 0.45
        ctx.lineWidth = 1.5
        const rBracket = radius * 1.24
        for (let a = 0; a < 4; a++) {
          const startAngle = (a * Math.PI) / 2 + 0.25
          ctx.beginPath()
          ctx.arc(0, 0, rBracket, startAngle, startAngle + 0.38)
          ctx.stroke()
        }
        ctx.restore()
      }

      ctx.restore()
    }

    const render = () => {
      frame++
      const t = frame * 0.016

      // Smoothly interpolate mouse position
      mouse.x += (mouse.targetX - mouse.x) * 0.09
      mouse.y += (mouse.targetY - mouse.y) * 0.09

      const isMars = activePlanetRef.current === 'mars'
      marsFocus += ((isMars ? 1 : 0) - marsFocus) * 0.06
      const moonFocus = 1 - marsFocus

      const parallaxX = ((mouse.x - width * 0.5) / Math.max(1, width)) * 2
      const parallaxY = ((mouse.y - height * 0.5) / Math.max(1, height)) * 2

      ctx.clearRect(0, 0, width, height)

      // 1. Animated Solar Wind / Nebula Aurora Waves
      for (let w = 0; w < 3; w++) {
        ctx.save()
        ctx.beginPath()
        const baseY = height * (0.22 + w * 0.28)
        ctx.moveTo(0, baseY)
        for (let x = 0; x <= width; x += 40) {
          const y =
            baseY +
            Math.sin(x * 0.004 + t * (0.8 + w * 0.3) + w) * 34 +
            Math.cos(x * 0.009 - t * 0.5) * 16 +
            parallaxY * 18
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = isMars
          ? `rgba(249, 115, 22, ${0.07 - w * 0.015})`
          : `rgba(34, 211, 238, ${0.07 - w * 0.015})`
        ctx.lineWidth = 28 - w * 6
        ctx.filter = 'blur(12px)'
        ctx.stroke()
        ctx.restore()
      }

      // 2. Twinkling Multi-Depth Starfield with Cursor Parallax
      stars.forEach((s) => {
        const sx = (s.x - parallaxX * 28 * s.z + width) % width
        const sy = (s.y - parallaxY * 28 * s.z + height) % height
        const alpha =
          s.baseAlpha * (0.55 + 0.45 * Math.sin(t * 60 * s.twinkleSpeed + s.phase))
        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // 3. Shooting Comets
      if (Math.random() < 0.018 && comets.length < 3) {
        spawnComet()
      }
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i]
        c.x += c.vx
        c.y += c.vy
        c.alpha -= 0.008

        if (c.alpha <= 0 || c.x < -100 || c.y > height + 100) {
          comets.splice(i, 1)
          continue
        }

        const tailX = c.x - c.vx * (c.length / 6)
        const tailY = c.y - c.vy * (c.length / 6)
        const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY)
        grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`)
        grad.addColorStop(0.3, c.color)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.strokeStyle = grad
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.moveTo(c.x, c.y)
        ctx.lineTo(tailX, tailY)
        ctx.stroke()
      }

      // 4. Interactive Constellation Telemetry Nodes (React to Cursor)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = Math.hypot(dx, dy)

        // Gentle orbital attraction toward cursor
        if (mouse.active && dist < 210 && dist > 10) {
          n.x += (dx / dist) * 0.75
          n.y += (dy / dist) * 0.75

          ctx.strokeStyle = isMars
            ? `rgba(251, 146, 60, ${(1 - dist / 210) * 0.38})`
            : `rgba(34, 211, 238, ${(1 - dist / 210) * 0.38})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(n.x, n.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }

        ctx.fillStyle = n.color
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // 5. Dual Planetary Theatre: Mars (Top-Right / Left-Top) & Moon (Bottom-Left / Top-Right)
      const minDim = Math.min(width, height)
      const marsX = width * 0.84 - parallaxX * 36
      const marsY = height * 0.24 - parallaxY * 36
      const marsRadius = Math.max(68, minDim * (0.14 + marsFocus * 0.055))

      const moonX = width * 0.15 + parallaxX * 28
      const moonY = height * 0.76 + parallaxY * 28
      const moonRadius = Math.max(58, minDim * (0.12 + moonFocus * 0.055))

      // Interplanetary Hohmann Transfer Trajectory Arc Connecting Moon & Mars
      ctx.save()
      ctx.beginPath()
      const ctrlX = width * 0.5 + parallaxX * 15
      const ctrlY = height * 0.12 + parallaxY * 15
      ctx.moveTo(moonX, moonY)
      ctx.quadraticCurveTo(ctrlX, ctrlY, marsX, marsY)
      ctx.strokeStyle = isMars ? 'rgba(251, 146, 60, 0.18)' : 'rgba(34, 211, 238, 0.18)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([8, 10])
      ctx.stroke()

      // Animated Transfer Spacecraft pulses traveling along the trajectory curve
      for (let p = 0; p < 3; p++) {
        const u = ((t * 0.18 + p / 3) % 1)
        const inv = 1 - u
        const px = inv * inv * moonX + 2 * inv * u * ctrlX + u * u * marsX
        const py = inv * inv * moonY + 2 * inv * u * ctrlY + u * u * marsY
        ctx.fillStyle = isMars ? '#fde047' : '#67e8f9'
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      // Render Both Animated Planetary Systems
      drawPlanetSystem(moonX, moonY, moonRadius, false, moonFocus, t)
      drawPlanetSystem(marsX, marsY, marsRadius, true, marsFocus, t)

      // 6. Cursor Plasma Particle Trail & Interactive Telemetry Reticle
      for (let i = cursorParticles.length - 1; i >= 0; i--) {
        const cp = cursorParticles[i]
        cp.x += cp.vx
        cp.y += cp.vy
        cp.life++
        if (cp.life >= cp.maxLife) {
          cursorParticles.splice(i, 1)
          continue
        }
        const ratio = 1 - cp.life / cp.maxLife
        ctx.fillStyle = cp.color
        ctx.globalAlpha = ratio * 0.85
        ctx.beginPath()
        ctx.arc(cp.x, cp.y, cp.size * ratio, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (mouse.active) {
        ctx.save()
        ctx.translate(mouse.x, mouse.y)
        ctx.rotate(t * 1.4)
        ctx.strokeStyle = isMars ? 'rgba(251, 146, 60, 0.45)' : 'rgba(34, 211, 238, 0.45)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(0, 0, 18, 0, Math.PI * 0.6)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 18, Math.PI, Math.PI * 1.6)
        ctx.stroke()
        ctx.restore()
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}

/**
 * MiniPlanetVideoCanvas — 60fps live canvas inside each planet selection card (Mars & Moon).
 * Renders a rotating 3D sphere, scrolling canyons/craters, atmospheric corona,
 * tilted 3D orbital rings, and orbiting satellites that speed up on hover/selection.
 */
export function MiniPlanetVideoCanvas({
  planet,
  active,
  hovered,
}: {
  planet: PlanetId
  active: boolean
  hovered: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef({ active, hovered })
  stateRef.current = { active, hovered }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 76
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const img = new Image()
    img.src = planet === 'mars' ? '/assets/menu/planet02.png' : '/assets/menu/planet05.png'

    let frame = 0
    let rafId = 0

    const render = () => {
      const { active: isAct, hovered: isHov } = stateRef.current
      const speedMult = isHov ? 2.2 : isAct ? 1.45 : 0.85
      frame += speedMult
      const t = frame * 0.022

      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const r = 21

      ctx.save()
      ctx.translate(cx, cy)

      // 1. Pulsing Atmospheric Glow
      const glowR = r * (isAct || isHov ? 1.65 + Math.sin(t * 2) * 0.1 : 1.35)
      const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, glowR)
      if (planet === 'mars') {
        glow.addColorStop(0, isAct || isHov ? 'rgba(249,115,22,0.65)' : 'rgba(249,115,22,0.3)')
        glow.addColorStop(1, 'rgba(249,115,22,0)')
      } else {
        glow.addColorStop(0, isAct || isHov ? 'rgba(34,211,238,0.65)' : 'rgba(34,211,238,0.3)')
        glow.addColorStop(1, 'rgba(34,211,238,0)')
      }
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(0, 0, glowR, 0, Math.PI * 2)
      ctx.fill()

      // 2. Back Orbital Ring
      const tilt = planet === 'mars' ? -0.38 : 0.38
      ctx.save()
      ctx.rotate(tilt)
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 1.58, r * 0.48, 0, Math.PI, Math.PI * 2)
      ctx.strokeStyle = planet === 'mars' ? '#fb923c' : '#22d3ee'
      ctx.globalAlpha = isAct || isHov ? 0.65 : 0.35
      ctx.lineWidth = 1.3
      ctx.stroke()
      ctx.restore()

      // 3. Planet Sphere
      ctx.save()
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.clip()

      const baseGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r)
      if (planet === 'mars') {
        baseGrad.addColorStop(0, '#fed7aa')
        baseGrad.addColorStop(0.38, '#ea580c')
        baseGrad.addColorStop(0.78, '#9a3412')
        baseGrad.addColorStop(1, '#3b0764')
      } else {
        baseGrad.addColorStop(0, '#ffffff')
        baseGrad.addColorStop(0.4, '#cbd5e1')
        baseGrad.addColorStop(0.78, '#475569')
        baseGrad.addColorStop(1, '#0f172a')
      }
      ctx.fillStyle = baseGrad
      ctx.fillRect(-r, -r, r * 2, r * 2)

      if (img.complete && img.naturalWidth > 0) {
        ctx.save()
        ctx.rotate(t * (planet === 'mars' ? 0.35 : -0.28))
        ctx.globalAlpha = 0.65
        ctx.drawImage(img, -r * 1.05, -r * 1.05, r * 2.1, r * 2.1)
        ctx.restore()
      }

      // Rotating 3D Longitude Grid
      ctx.strokeStyle =
        planet === 'mars' ? 'rgba(254, 215, 170, 0.35)' : 'rgba(165, 243, 252, 0.35)'
      ctx.lineWidth = 0.8
      for (let m = 0; m < 4; m++) {
        const phase = (t * 0.6 + (m * Math.PI) / 4) % Math.PI
        const rx = Math.abs(Math.cos(phase)) * r
        ctx.beginPath()
        ctx.ellipse(0, 0, Math.max(0.8, rx), r, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Specular highlight & night shadow
      const shade = ctx.createLinearGradient(-r, -r, r, r)
      shade.addColorStop(0, 'rgba(255,255,255,0.32)')
      shade.addColorStop(0.5, 'rgba(0,0,0,0)')
      shade.addColorStop(1, 'rgba(2,6,23,0.78)')
      ctx.fillStyle = shade
      ctx.fillRect(-r, -r, r * 2, r * 2)
      ctx.restore()

      // Rim Stroke
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.strokeStyle = planet === 'mars' ? '#fdba74' : '#67e8f9'
      ctx.globalAlpha = isAct || isHov ? 0.9 : 0.45
      ctx.lineWidth = 1.4
      ctx.stroke()
      ctx.globalAlpha = 1

      // 4. Front Orbital Ring & Live Orbiting Moons / Probes
      ctx.save()
      ctx.rotate(tilt)
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 1.58, r * 0.48, 0, 0, Math.PI)
      ctx.strokeStyle = planet === 'mars' ? '#fde047' : '#a5f3fc'
      ctx.globalAlpha = isAct || isHov ? 0.9 : 0.5
      ctx.lineWidth = 1.5
      ctx.stroke()

      for (let s = 0; s < 2; s++) {
        const ang = t * 1.4 + s * Math.PI
        const sx = Math.cos(ang) * r * 1.58
        const sy = Math.sin(ang) * r * 0.48
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      ctx.restore()
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [planet])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 76, height: 76 }}
      className="flex-shrink-0 pointer-events-none select-none"
    />
  )
}
