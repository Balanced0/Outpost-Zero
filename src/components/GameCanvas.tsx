import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import PreloadScene from '../scenes/PreloadScene'
import MarsScene from '../scenes/MarsScene'
import { useGameStore } from '../store/gameStore'
import { getClampedCanvasSize } from '../utils/qualitySettings'
import { debugLogger } from '../utils/debugLogger'

// Module-level singletons to guarantee exactly ONE live game instance
let activeGameInstance: Phaser.Game | null = null
let hasFallenBackToCanvas = false
let isFallbackInProgress = false

export function getActiveGame(): Phaser.Game | null {
  return activeGameInstance
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const [showReconnectingToast, setShowReconnectingToast] = useState(false)
  const [, setRendererKey] = useState(0)

  useEffect(() => {
    if (!isGameStarted) {
      if (activeGameInstance) {
        console.count('[Phaser Lifecycle] Destroying game because isGameStarted=false')
        try {
          activeGameInstance.destroy(true)
        } catch (e) {
          console.warn('[Phaser Lifecycle] Error during game destroy:', e)
        }
        activeGameInstance = null
        debugLogger.setLiveGameCount(0)
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let rAFId: number | null = null
    let contextLostTimer: number | null = null

    const safeDestroyExistingGame = (reason: string) => {
      if (activeGameInstance) {
        console.count(`[Phaser Lifecycle] Destroying prior instance (${reason})`)
        console.trace(`[Phaser Lifecycle] Destroy stack (${reason})`)
        try {
          activeGameInstance.destroy(true)
        } catch (e) {
          console.warn('[Phaser Lifecycle] Destroy error:', e)
        }
        activeGameInstance = null
        debugLogger.setLiveGameCount(0)
      }
    }

    const triggerCanvasFallback = (reason: string) => {
      if (hasFallenBackToCanvas || isFallbackInProgress) return
      isFallbackInProgress = true
      hasFallenBackToCanvas = true
      debugLogger.setFallbackRan(true)
      debugLogger.logError(`Triggering Canvas fallback (once): ${reason}`)
      console.warn(`[Phaser Lifecycle] Fallback to Canvas renderer triggered: ${reason}`)

      safeDestroyExistingGame('fallbackToCanvas')
      isFallbackInProgress = false

      // Trigger re-init with Canvas
      if (!cancelled) {
        setRendererKey((k) => k + 1)
      }
    }

    // Register callback for debugLogger if setExtensions/dispatchContextRestored fails
    debugLogger.onContextErrorFallback = () => {
      triggerCanvasFallback('setExtensions or dispatchContextRestored error')
    }

    /**
     * Bootstraps Phaser ONLY after the container measures a real, non-zero size.
     */
    const attemptInit = () => {
      if (cancelled) return

      const w = container.clientWidth
      const h = container.clientHeight

      if (w <= 0 || h <= 0) {
        rAFId = requestAnimationFrame(attemptInit)
        return
      }

      // If an instance already exists, do not recreate unless explicitly destroyed
      if (activeGameInstance) {
        console.warn('[Phaser Lifecycle] Game instance already exists, skipping duplicate creation')
        debugLogger.setLiveGameCount(1)
        return
      }

      const { effectiveDpr } = getClampedCanvasSize(w, h)
      const rendererType = hasFallenBackToCanvas ? Phaser.CANVAS : Phaser.AUTO

      console.count('[Phaser Lifecycle] Initializing Phaser.Game')
      console.log(`[Phaser Lifecycle] Initializing with renderer: ${hasFallenBackToCanvas ? 'CANVAS' : 'AUTO'}`)

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
        activeGameInstance = game
        debugLogger.setLiveGameCount(1)

        const canvas = game.canvas
        if (canvas) {
          // Listen for WebGL context loss
          // Do NOT destroy the game inside webglcontextlost! Let Phaser handle restore.
          const onContextLost = (e: Event) => {
            console.count('[Phaser Lifecycle] webglcontextlost event')
            // Calling preventDefault tells the browser we intend to handle/restore the context
            e.preventDefault()
            debugLogger.recordContextLost()
            setShowReconnectingToast(true)

            // If context stays lost for more than 3 seconds without restore, fallback to Canvas
            if (!hasFallenBackToCanvas) {
              if (contextLostTimer !== null) clearTimeout(contextLostTimer)
              contextLostTimer = window.setTimeout(() => {
                const gl = (game.renderer as unknown as { gl?: WebGLRenderingContext })?.gl
                const isStillLost = gl ? gl.isContextLost() : true
                if (isStillLost && !hasFallenBackToCanvas) {
                  setShowReconnectingToast(false)
                  triggerCanvasFallback('Context remained lost for > 3 seconds')
                }
              }, 3000)
            }
          }

          const onContextRestored = () => {
            console.count('[Phaser Lifecycle] webglcontextrestored event')
            if (contextLostTimer !== null) {
              clearTimeout(contextLostTimer)
              contextLostTimer = null
            }
            setShowReconnectingToast(false)
            console.log('[Phaser Lifecycle] WebGL context restored successfully')
          }

          canvas.addEventListener('webglcontextlost', onContextLost)
          canvas.addEventListener('webglcontextrestored', onContextRestored)

          // Verify WebGL renderer has gl context if WebGL mode was chosen
          if (game.renderer.type === Phaser.WEBGL) {
            const gl = (game.renderer as unknown as { gl?: WebGLRenderingContext }).gl
            if (!gl && !hasFallenBackToCanvas) {
              triggerCanvasFallback('WebGL renderer has no gl context after creation')
              return
            }
          }

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
        console.error('[Phaser Lifecycle] Game creation threw error:', err)
        if (!hasFallenBackToCanvas) {
          triggerCanvasFallback(`Game constructor threw: ${msg}`)
        } else {
          debugLogger.logError(`Fatal Phaser canvas initialization error: ${msg}`)
        }
      }
    }

    attemptInit()

    // Resizing only updates the canvas dimensions - NEVER recreates the game
    const resizeGame = () => {
      const g = activeGameInstance
      const c = containerRef.current
      if (!g || !c) return

      const w = c.clientWidth || window.innerWidth
      const h = c.clientHeight || window.innerHeight
      if (w <= 0 || h <= 0) return

      const { effectiveDpr } = getClampedCanvasSize(w, h)

      if (g.scale) {
        ;(g.scale as unknown as { resolution?: number }).resolution = effectiveDpr
        g.scale.resize(w, h)
      }

      // Refresh MarsScene camera and bounds
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
      if (contextLostTimer !== null) clearTimeout(contextLostTimer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resizeGame)
      window.removeEventListener('orientationchange', resizeGame)
      debugLogger.onContextErrorFallback = undefined

      safeDestroyExistingGame('React unmount cleanup')
    }
  }, [isGameStarted])

  if (!isGameStarted) {
    return null
  }

  return (
    <>
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
      {showReconnectingToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99995] bg-slate-900/90 text-amber-300 border border-amber-500/50 px-4 py-2 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-pulse pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Reconnecting graphics...
        </div>
      )}
    </>
  )
}
