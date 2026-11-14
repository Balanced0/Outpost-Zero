import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import PreloadScene from '../scenes/PreloadScene'
import MarsScene from '../scenes/MarsScene'
import { useGameStore } from '../store/gameStore'
import { getClampedCanvasSize, isLowQualityMode } from '../utils/qualitySettings'
import { debugLogger } from '../utils/debugLogger'

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const [useCanvasRenderer, setUseCanvasRenderer] = useState(!checkWebGLSupport())

  useEffect(() => {
    if (!isGameStarted) {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let rAFId: number | null = null

    // Guard against React StrictMode creating duplicate game instances
    if (gameRef.current) {
      gameRef.current.destroy(true)
      gameRef.current = null
    }

    /**
     * Initializer: only boots Phaser once the container measures a real size > 0.
     * Prevents iPad Safari from initializing a 0x0 WebGL context before CSS dvh resolves.
     */
    const attemptInit = () => {
      if (cancelled) return
      const w = container.clientWidth
      const h = container.clientHeight

      if (w <= 0 || h <= 0) {
        rAFId = requestAnimationFrame(attemptInit)
        return
      }

      // Compute clamped buffer dimensions (max 4M pixels, max DPR 2)
      const { effectiveDpr } = getClampedCanvasSize(w, h)
      const rendererType = useCanvasRenderer ? Phaser.CANVAS : Phaser.AUTO

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config: any = {
        type: rendererType,
        parent: container,
        width: w,
        height: h,
        resolution: effectiveDpr,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: container,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        backgroundColor: '#1a0a00',
        physics: { default: 'arcade', arcade: { debug: false } },
        scene: [PreloadScene, MarsScene],
      }

      try {
        const game = new Phaser.Game(config)
        gameRef.current = game

        // Record renderer diagnostics
        const canvas = game.canvas
        if (canvas) {
          // Listen for WebGL context loss (iPad Safari VRAM pressure)
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            debugLogger.logError('WebGL context lost! Falling back to Phaser Canvas renderer...')
            if (gameRef.current) {
              gameRef.current.destroy(true)
              gameRef.current = null
            }
            setUseCanvasRenderer(true)
          })

          const gl = (game.renderer as unknown as { gl?: WebGLRenderingContext }).gl
          const maxTex = gl
            ? gl.getParameter(gl.MAX_TEXTURE_SIZE)
            : ((game.renderer as unknown as { getMaxTextureSize?: () => number }).getMaxTextureSize?.() ?? 2048)

          debugLogger.setRendererInfo({
            type: game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas',
            maxTextureSize: maxTex,
            canvasBackingW: canvas.width,
            canvasBackingH: canvas.height,
            canvasCssW: w,
            canvasCssH: h,
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        debugLogger.logError(`Phaser initialization failed (${useCanvasRenderer ? 'Canvas' : 'WebGL'}): ${msg}`)
        if (!useCanvasRenderer) {
          // Retry with Canvas renderer
          setUseCanvasRenderer(true)
        }
      }
    }

    attemptInit()

    const resizeGame = () => {
      const g = gameRef.current
      const c = containerRef.current
      if (!g || !c) return

      const w = c.clientWidth || window.innerWidth
      const h = c.clientHeight || window.innerHeight
      if (w <= 0 || h <= 0) return

      const { effectiveDpr } = getClampedCanvasSize(w, h)

      // Apply resolution to scale manager
      if (g.scale) {
        (g.scale as unknown as { resolution?: number }).resolution = effectiveDpr
        g.scale.resize(w, h)
      }

      // Refresh MarsScene camera, zoom, bounds, and ground coverage
      const marsScene = g.scene.getScene('MarsScene') as MarsScene | undefined
      if (marsScene && marsScene.scene?.isActive()) {
        marsScene.refreshViewport(w, h)
      }

      if (g.canvas) {
        debugLogger.setRendererInfo({
          type: g.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas',
          canvasBackingW: g.canvas.width,
          canvasBackingH: g.canvas.height,
          canvasCssW: w,
          canvasCssH: h,
        })
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeGame()
    })
    resizeObserver.observe(container)

    window.addEventListener('resize', resizeGame)
    window.addEventListener('orientationchange', resizeGame)

    return () => {
      cancelled = true
      if (rAFId !== null) cancelAnimationFrame(rAFId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeGame)
      window.removeEventListener('orientationchange', resizeGame)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [isGameStarted, useCanvasRenderer])

  if (!isGameStarted) {
    return null
  }

  return (
    <div
      ref={containerRef}
      id="game-container"
      className="fixed inset-0 w-[100vw] overflow-hidden m-0 p-0 pointer-events-auto"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: 'var(--app-h, 100dvh)',
        overflow: 'hidden',
      }}
    />
  )
}
