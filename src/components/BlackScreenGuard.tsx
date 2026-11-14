import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { setLowQualityMode } from '../utils/qualitySettings'
import { debugLogger } from '../utils/debugLogger'
import { AlertTriangleIcon } from './icons/MissionIcons'

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
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-[#04060d]/90 backdrop-blur-md pointer-events-auto select-none">
      <div className="mission-panel border border-amber-400/60 text-white rounded-[28px] p-6 sm:p-8 max-w-md w-full flex flex-col items-center text-center gap-4 animate-modal-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <AlertTriangleIcon size={32} />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block mb-1">
            Display Memory Protection
          </span>
          <h2 className="font-display text-2xl font-bold text-white">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
            The game canvas did not start rendering. Tablets and iPad Safari can run out of canvas memory on high-resolution screens.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            onClick={handleReload}
            className="flex-1 min-h-[46px] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold rounded-xl border border-white/15 active:scale-95 transition-all text-sm cursor-pointer"
          >
            Reload
          </button>
          <button
            onClick={handleTryLowQuality}
            className="flex-1 min-h-[46px] py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-display font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(245,158,11,0.5)] active:scale-95 transition-all text-sm cursor-pointer"
          >
            Try Low Quality Mode
          </button>
        </div>
      </div>
    </div>
  )
}
