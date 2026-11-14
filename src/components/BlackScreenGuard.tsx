import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { setLowQualityMode } from '../utils/qualitySettings'
import { debugLogger } from '../utils/debugLogger'
import { getActiveGame } from './GameCanvas'

export default function BlackScreenGuard() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)

  const [hasTimedOut, setHasTimedOut] = useState(false)

  // The world is supposed to be visible ONLY during active gameplay (daytime or sunset)
  // Never during loading screen, menu, morning screen, result card, or paused
  const isWorldSupposedToBeVisible =
    isGameStarted &&
    (dayPhase === 'daytime' || dayPhase === 'sunset') &&
    !isMissionComplete &&
    !isAirDepleted &&
    !isCrewDepleted

  useEffect(() => {
    // If world is not supposed to be visible, never show black screen card
    if (!isWorldSupposedToBeVisible) {
      setHasTimedOut(false)
      return
    }

    const getFrameNumber = (): number => {
      const g = getActiveGame()
      if (g && g.loop && typeof g.loop.frame === 'number') {
        return g.loop.frame
      }
      return debugLogger.frameCount
    }

    let lastFrame = getFrameNumber()
    let stuckSeconds = 0

    const interval = setInterval(() => {
      const currentFrame = getFrameNumber()

      if (currentFrame > lastFrame) {
        // Frames are advancing normally! Reset stuck timer.
        lastFrame = currentFrame
        stuckSeconds = 0
      } else {
        // Frame has not advanced
        stuckSeconds += 1
        console.warn(
          `[BlackScreenGuard] Frame ${currentFrame} has not advanced for ${stuckSeconds}s (world visible)`
        )

        // Only count as black screen if frame has not advanced for 8 full seconds
        if (stuckSeconds >= 8) {
          debugLogger.logError(
            `Black screen detected: Frame stuck at ${currentFrame} for 8s while world visible`
          )
          setHasTimedOut(true)
        }
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isWorldSupposedToBeVisible])

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
          The game graphics stopped rendering. Tablets and Safari can run out of canvas memory on high-resolution screens.
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
