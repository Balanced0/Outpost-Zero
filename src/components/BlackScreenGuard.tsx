import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { setLowQualityMode } from '../utils/qualitySettings'
import { debugLogger } from '../utils/debugLogger'

export default function BlackScreenGuard() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!isGameStarted) {
      setHasTimedOut(false)
      return
    }

    let frameRendered = false

    const handleFrame = () => {
      frameRendered = true
    }

    window.addEventListener('phaser-frame-rendered', handleFrame, { once: true })

    const timer = setTimeout(() => {
      if (!frameRendered) {
        debugLogger.logError('Black screen detected: No frame rendered 5 seconds after launch')
        setHasTimedOut(true)
      }
    }, 5000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('phaser-frame-rendered', handleFrame)
    }
  }, [isGameStarted])

  if (!hasTimedOut) return null

  const handleReload = () => {
    window.location.reload()
  }

  const handleTryLowQuality = () => {
    setLowQualityMode(true)
    const url = new URL(window.location.href)
    url.searchParams.set('low', '1')
    window.location.href = url.toString()
  }

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/90 pointer-events-auto select-none">
      <div className="bg-slate-900 border-2 border-amber-400 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-fade-in">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-black text-amber-300">Something went wrong</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The game canvas did not start rendering. Tablets and Safari can run out of canvas memory on high-resolution screens.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            onClick={handleReload}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-600 active:scale-95 transition-all text-sm"
          >
            Reload
          </button>
          <button
            onClick={handleTryLowQuality}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
          >
            Try Low Quality Mode
          </button>
        </div>
      </div>
    </div>
  )
}
