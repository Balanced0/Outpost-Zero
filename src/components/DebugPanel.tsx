import { useEffect, useState } from 'react'
import { debugLogger } from '../utils/debugLogger'
import { isLowQualityMode, getEffectiveDpr } from '../utils/qualitySettings'
import { getActiveGame } from './GameCanvas'

export default function DebugPanel() {
  const [, setTick] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const [forceClosed, setForceClosed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const unsub = debugLogger.subscribe(() => {
      setTick((t) => t + 1)
    })

    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 500)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  if (forceClosed) return null

  const isVisible = debugLogger.isDebugActive()
  if (!isVisible) return null

  const textures = Array.from(debugLogger.textures.values())
  const errors = debugLogger.errors
  const isLowQ = isLowQualityMode()
  const dpr = window.devicePixelRatio || 1
  const effectiveDpr = getEffectiveDpr()
  const vv = window.visualViewport
  const activeGame = getActiveGame()
  const currentFrame = activeGame?.loop?.frame ?? debugLogger.frameCount
  const activeFlags = debugLogger.getActiveFlags()

  const handleCopyAll = () => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      flags: activeFlags,
      viewport: {
        innerW: window.innerWidth,
        innerH: window.innerHeight,
        dpr,
        effectiveDpr,
        visualViewport: vv ? `${Math.round(vv.width)}x${Math.round(vv.height)}` : null,
      },
      diagnostics: {
        liveGameCount: debugLogger.liveGameCount,
        rendererType: debugLogger.rendererType,
        contextLostEvents: debugLogger.contextLostCount,
        fallbackRan: debugLogger.fallbackRan,
        frameCount: currentFrame,
        maxTextureSize: debugLogger.maxTextureSize,
        canvasCss: `${debugLogger.canvasCssW}x${debugLogger.canvasCssH}`,
        canvasBuffer: `${debugLogger.canvasBackingW}x${debugLogger.canvasBackingH}`,
      },
      textures,
      errors,
    }

    const text = JSON.stringify(report, null, 2)
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // Fallback prompt for Safari if clipboard API fails
      window.prompt('Copy diagnostics:', text)
    })
  }

  return (
    <div className="fixed top-2 left-2 z-[99999] pointer-events-auto font-mono text-[11px] select-text max-w-[92vw] sm:max-w-md">
      {/* Prominent Error Box with full message and full stack */}
      {errors.length > 0 && (
        <div className="bg-red-950/98 border-2 border-red-500 text-white rounded-xl p-3 shadow-2xl mb-2">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-red-700/60 font-bold text-red-200">
            <span className="flex items-center gap-1.5">
              <span>🚨 Errors ({errors.length})</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyAll}
                className="text-[10px] bg-red-800 hover:bg-red-700 active:scale-95 px-2 py-0.5 rounded text-white font-bold"
              >
                {copied ? '✓ Copied!' : 'Copy all'}
              </button>
              <button
                onClick={() => {
                  debugLogger.errors = []
                  debugLogger.hasError = false
                  setTick((t) => t + 1)
                }}
                className="text-[10px] bg-red-900 hover:bg-red-800 px-1.5 py-0.5 rounded text-red-200"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto text-red-100 text-[10px]">
            {errors.map((err) => (
              <div key={err.id} className="bg-red-900/60 p-2 rounded border border-red-800/80">
                <div className="font-bold text-red-200">
                  [{err.timestamp}] {err.message}
                </div>
                {err.stack && (
                  <pre className="mt-1 pt-1 border-t border-red-800/50 text-[9px] text-red-300 font-mono whitespace-pre-wrap break-all select-all">
                    {err.stack}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Diagnostics Window */}
      <div className="bg-slate-950/98 border border-cyan-500/70 text-slate-200 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-cyan-400">Diagnostics (?debug=1)</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyAll}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-cyan-300"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300"
            >
              {minimized ? 'Expand' : 'Collapse'}
            </button>
            <button
              onClick={() => setForceClosed(true)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-red-300"
            >
              ✕
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="p-3 space-y-2 max-h-[75vh] overflow-y-auto text-[10px]">
            {/* Active URL Flags */}
            <div className="space-y-0.5 border-b border-slate-800/80 pb-2">
              <div className="text-cyan-300 font-bold">ACTIVE URL FLAGS</div>
              {Object.keys(activeFlags).length === 0 ? (
                <div className="text-slate-500 italic">None (default mode)</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(activeFlags).map(([k, v]) => (
                    <span key={k} className="bg-slate-800 border border-cyan-500/40 text-cyan-200 px-1.5 py-0.5 rounded text-[9px]">
                      {k}={v}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* System Info */}
            <div className="space-y-0.5 border-b border-slate-800/80 pb-2">
              <div className="text-cyan-300 font-bold">DEVICE & VIEWPORT</div>
              <div className="text-slate-400 break-words text-[9px]">{navigator.userAgent}</div>
              <div>DPR: <span className="text-white">{dpr}</span> (Render scale: <span className="text-amber-300">{effectiveDpr}</span>)</div>
              <div>Inner: <span className="text-white">{window.innerWidth} × {window.innerHeight}</span></div>
              <div>VisualViewport: <span className="text-white">{vv ? `${Math.round(vv.width)} × ${Math.round(vv.height)}` : 'N/A'}</span></div>
              <div>Touch points: <span className="text-white">{navigator.maxTouchPoints || 0}</span> ({('ontouchstart' in window) ? 'touch supported' : 'no ontouchstart'})</div>
              <div>Quality Mode: <span className={isLowQ ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{isLowQ ? 'LOW' : 'NORMAL'}</span></div>
            </div>

            {/* Renderer & Canvas Diagnostics */}
            <div className="space-y-0.5 border-b border-slate-800/80 pb-2">
              <div className="text-cyan-300 font-bold">RENDERER & INSTANCES</div>
              <div>
                Live Game Count:{' '}
                <span
                  className={
                    debugLogger.liveGameCount === 1
                      ? 'text-emerald-400 font-bold'
                      : debugLogger.liveGameCount === 0
                      ? 'text-slate-400'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {debugLogger.liveGameCount}
                </span>
              </div>
              <div>
                Renderer Type:{' '}
                <span className="text-emerald-400 font-bold">{debugLogger.rendererType}</span>
              </div>
              <div>
                Context Lost Events:{' '}
                <span
                  className={
                    debugLogger.contextLostCount === 0
                      ? 'text-emerald-400'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {debugLogger.contextLostCount}
                </span>
              </div>
              <div>
                Canvas Fallback Ran:{' '}
                <span
                  className={
                    debugLogger.fallbackRan ? 'text-amber-400 font-bold' : 'text-emerald-400'
                  }
                >
                  {debugLogger.fallbackRan ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                Frames Advanced:{' '}
                <span className="text-cyan-300 font-bold">{currentFrame}</span>
              </div>
              <div>
                GL Max Texture:{' '}
                <span className="text-white">
                  {debugLogger.maxTextureSize ? `${debugLogger.maxTextureSize}px` : 'N/A'}
                </span>
              </div>
              <div>
                Canvas CSS:{' '}
                <span className="text-white">
                  {debugLogger.canvasCssW} × {debugLogger.canvasCssH}
                </span>
              </div>
              <div>
                Canvas Buffer:{' '}
                <span className="text-white">
                  {debugLogger.canvasBackingW} × {debugLogger.canvasBackingH}
                </span>{' '}
                ({Math.round((debugLogger.canvasBackingW * debugLogger.canvasBackingH) / 1000)}k px)
              </div>
            </div>

            {/* Registered Textures */}
            <div className="space-y-0.5">
              <div className="text-cyan-300 font-bold">CODE TEXTURES ({textures.length})</div>
              {textures.length === 0 ? (
                <div className="text-slate-500 italic">None registered yet</div>
              ) : (
                <div className="space-y-1">
                  {textures.map((t) => (
                    <div key={t.key} className="flex justify-between text-slate-300 bg-slate-900/60 px-1.5 py-0.5 rounded">
                      <span className="truncate pr-2">{t.key}</span>
                      <span className={t.width > 2048 || t.height > 2048 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {t.width} × {t.height}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
