import { useGameStore } from '../store/gameStore'

export default function StormOverlay() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const stormState = useGameStore((s) => s.stormState)
  const stormCountdown = useGameStore((s) => s.stormCountdown)
  const stormLevel = useGameStore((s) => s.stormLevelToday)
  const isRoverSheltered = useGameStore((s) => s.isRoverSheltered)
  const dayPhase = useGameStore((s) => s.dayPhase)

  if (!isGameStarted || dayPhase === 'morning' || dayPhase === 'ended') {
    return null
  }

  return (
    <>
      {/* 1. Countdown Warning Banner (10s before storm) */}
      {stormState === 'warning' && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse w-[92vw] max-w-sm flex justify-center">
          <div className="bg-red-600/90 border-2 border-amber-300 text-white font-extrabold px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-2.5 backdrop-blur-sm w-full text-center">
            <span className="text-xl sm:text-2xl animate-spin flex-shrink-0">⚡</span>
            <div className="flex flex-col items-center min-w-0">
              <span className="text-xs sm:text-sm uppercase tracking-wider text-amber-200 font-bold truncate">
                Solar Storm Warning!
              </span>
              <span className="text-sm sm:text-base font-extrabold">
                Radiation arrives in {stormCountdown}...
              </span>
            </div>
            <span className="text-xl sm:text-2xl animate-spin flex-shrink-0">⚡</span>
          </div>
        </div>
      )}

      {/* 2. Active Storm Visual & Proximity Status (15s duration) */}
      {stormState === 'active' && (
        <>
          {/* Mild red-orange storm atmosphere flicker overlay */}
          <div className="fixed inset-0 w-[100vw] h-[100dvh] pointer-events-none z-15 overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-red-600/25 mix-blend-color-burn animate-pulse transition-opacity duration-1000" />
            <div className="absolute inset-0 w-full h-full bg-amber-500/15 mix-blend-screen animate-pulse" />
          </div>

          {/* Storm status banner with rover shelter status */}
          <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1.5 w-[92vw] max-w-sm">
            <div className="bg-red-950/90 border-2 border-red-500 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center justify-center gap-2 backdrop-blur-md w-full text-center">
              <span className="text-lg">🚨</span>
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                {stormLevel === 'strong' ? 'Strong' : 'Minor'} Radiation Storm Active
              </span>
            </div>

            {/* Rover Sheltered vs Exposed Indicator */}
            {isRoverSheltered ? (
              <div className="bg-emerald-600/90 border border-emerald-300 text-white font-bold text-xs px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Rover safe at base</span>
              </div>
            ) : (
              <div className="bg-amber-600/95 border-2 border-amber-300 text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xl animate-bounce flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Rover exposed! Drive home!</span>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
