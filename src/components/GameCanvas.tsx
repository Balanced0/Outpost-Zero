import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import PreloadScene from '../scenes/PreloadScene'
import MarsScene from '../scenes/MarsScene'
import { useGameStore } from '../store/gameStore'
import { getClampedCanvasSize } from '../utils/qualitySettings'
import { debugLogger, setActiveGame, getActiveGame } from '../utils/debugLogger'

export { getActiveGame }

// Module-level singletons to guarantee running game instance tracking
let activeGameInstance: Phaser.Game | null = null
let hasFallenBackToCanvas = false
let isFallbackInProgress = false

function getRequestedRenderer(): number {
  if (typeof window === 'undefined') return Phaser.AUTO
  const params = new URLSearchParams(window.location.search)
  const r = params.get('renderer')?.toLowerCase()
  if (r === 'canvas') return Phaser.CANVAS
  if (r === 'webgl') return Phaser.WEBGL
  return Phaser.AUTO
}

function isForceWebGL(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('renderer')?.toLowerCase() === 'webgl'
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const [showReconnectingToast, setShowReconnectingToast] = useState(false)

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
        setActiveGame(null)
        debugLogger.setLiveGameCount(0)
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let rAFId: number | null = null
    let contextLostTimer: number | null = null
    let currentWrapper: HTMLDivElement | null = null

    /**
     * Creates a replacement game with Canvas renderer FIRST on a brand new DOM container,
     * waits until it renders, and only then tears down the old WebGL game.
     * Guarantees Live Game Count NEVER drops to 0.
     */
    const triggerCanvasFallback = (reason: string) => {
      if (isForceWebGL()) {
        console.warn('[Phaser Lifecycle] ?renderer=webgl is active; ignoring Canvas fallback request:', reason)
        return
      }
      if (hasFallenBackToCanvas || isFallbackInProgress) return
      isFallbackInProgress = true
      hasFallenBackToCanvas = true
      debugLogger.setFallbackRan(true)
      debugLogger.logError(`Triggering Canvas fallback (once): ${reason}`)
      console.warn(`[Phaser Lifecycle] Initiating replacement Canvas game (reason: ${reason})`)

      const oldGame = activeGameInstance
      const oldWrapper = currentWrapper

      // Create brand new wrapper div for the Canvas renderer (cannot reuse a canvas that had WebGL context)
      const replacementWrapper = document.createElement('div')
      replacementWrapper.id = 'phaser-canvas-wrapper'
      replacementWrapper.style.position = 'absolute'
      replacementWrapper.style.inset = '0'
      replacementWrapper.style.width = '100%'
      replacementWrapper.style.height = '100%'
      replacementWrapper.style.overflow = 'hidden'
      container.appendChild(replacementWrapper)
      currentWrapper = replacementWrapper

      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      const { effectiveDpr } = getClampedCanvasSize(w, h)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config: any = {
        type: Phaser.CANVAS,
        parent: replacementWrapper,
        width: w,
        height: h,
        resolution: effectiveDpr,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: replacementWrapper,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        backgroundColor: '#1a0a00',
        physics: { default: 'arcade', arcade: { debug: false } },
        scene: [PreloadScene, MarsScene],
      }

      try {
        const replacementGame = new Phaser.Game(config)
        // Keep live count >= 1 throughout transition
        debugLogger.setLiveGameCount(1)

        // Wait until replacement game executes its first step before destroying the old game
        let hasSwapped = false
        const cleanupOldGame = () => {
          if (hasSwapped) return
          hasSwapped = true
          activeGameInstance = replacementGame
          setActiveGame(replacementGame)
          debugLogger.setLiveGameCount(1)
          isFallbackInProgress = false

          debugLogger.setRendererInfo({
            type: 'Canvas',
            maxTextureSize: 2048,
            canvasBackingW: replacementGame.canvas?.width || w,
            canvasBackingH: replacementGame.canvas?.height || h,
            canvasCssW: w,
            canvasCssH: h,
          })

          if (oldGame) {
            console.log('[Phaser Lifecycle] Replacement Canvas game ready. Tearing down old WebGL game...')
            try {
              const gl = (oldGame.renderer as unknown as { gl?: WebGLRenderingContext })?.gl
              gl?.getExtension('WEBGL_lose_context')?.loseContext()
              oldGame.destroy(true)
            } catch (e) {
              console.warn('[Phaser Lifecycle] Error disposing old game context:', e)
            }
          }
          if (oldWrapper && oldWrapper.parentNode) {
            oldWrapper.parentNode.removeChild(oldWrapper)
          }
        }

        replacementGame.events.once('step', cleanupOldGame)
        // Safety timeout: swap after 500ms even if event listener doesn't fire
        setTimeout(cleanupOldGame, 500)
      } catch (err) {
        isFallbackInProgress = false
        const msg = err instanceof Error ? err.message : String(err)
        debugLogger.logError(`Replacement Canvas game failed to initialize: ${msg}`)
        console.error('[Phaser Lifecycle] Replacement game creation failed:', err)
      }
    }

    // Connect debugLogger context restore error hook to fallback
    debugLogger.onContextErrorFallback = () => {
      triggerCanvasFallback('Phaser context restore (createResource/setExtensions) error')
    }

    /**
     * Initializes the primary game instance.
     */
    const attemptInit = () => {
      if (cancelled) return

      const w = container.clientWidth
      const h = container.clientHeight

      if (w <= 0 || h <= 0) {
        rAFId = requestAnimationFrame(attemptInit)
        return
      }

      if (activeGameInstance) {
        console.warn('[Phaser Lifecycle] Game instance already exists, skipping duplicate creation')
        debugLogger.setLiveGameCount(1)
        return
      }

      // Create initial wrapper
      const wrapper = document.createElement('div')
      wrapper.id = 'phaser-active-wrapper'
      wrapper.style.position = 'absolute'
      wrapper.style.inset = '0'
      wrapper.style.width = '100%'
      wrapper.style.height = '100%'
      wrapper.style.overflow = 'hidden'
      container.appendChild(wrapper)
      currentWrapper = wrapper

      const requestedRenderer = getRequestedRenderer()
      const { effectiveDpr } = getClampedCanvasSize(w, h)

      console.count('[Phaser Lifecycle] Initializing Phaser.Game')
      console.log(`[Phaser Lifecycle] Renderer selected: ${requestedRenderer === Phaser.CANVAS ? 'CANVAS' : requestedRenderer === Phaser.WEBGL ? 'WEBGL' : 'AUTO'}`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config: any = {
        type: requestedRenderer,
        parent: wrapper,
        width: w,
        height: h,
        resolution: effectiveDpr,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: wrapper,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
        backgroundColor: '#1a0a00',
        physics: { default: 'arcade', arcade: { debug: false } },
        scene: [PreloadScene, MarsScene],
      }

      try {
        const game = new Phaser.Game(config)
        activeGameInstance = game
        setActiveGame(game)
        debugLogger.setLiveGameCount(1)

        const canvas = game.canvas
        if (canvas) {
          // Listen for WebGL context loss
          const onContextLost = (e: Event) => {
            console.count('[Phaser Lifecycle] webglcontextlost event')
            e.preventDefault()
            debugLogger.recordContextLost()
            setShowReconnectingToast(true)

            if (!hasFallenBackToCanvas && !isForceWebGL()) {
              if (contextLostTimer !== null) clearTimeout(contextLostTimer)
              // Wait up to 3 seconds for webglcontextrestored
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
            if (!gl && !hasFallenBackToCanvas && !isForceWebGL()) {
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
        if (!hasFallenBackToCanvas && !isForceWebGL()) {
          triggerCanvasFallback(`Game constructor threw: ${msg}`)
        } else {
          debugLogger.logError(`Fatal Phaser initialization error: ${msg}`)
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

      if (activeGameInstance) {
        console.count('[Phaser Lifecycle] React unmount cleanup: destroying Phaser.Game')
        try {
          activeGameInstance.destroy(true)
        } catch (e) {
          console.warn('[Phaser Lifecycle] Destroy on unmount failed:', e)
        }
        activeGameInstance = null
        setActiveGame(null)
        debugLogger.setLiveGameCount(0)
      }
      if (container) {
        container.innerHTML = ''
      }
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
