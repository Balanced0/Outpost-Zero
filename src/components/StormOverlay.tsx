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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-pulse">
          <div className="bg-red-600/90 border-2 border-amber-300 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm">
            <span className="text-2xl animate-spin">⚡</span>
            <div className="flex flex-col items-center">
              <span className="text-sm uppercase tracking-wider text-amber-200">
                Solar Storm Warning!
              </span>
              <span className="text-lg">
                Radiation arrives in {stormCountdown}...
              </span>
            </div>
            <span className="text-2xl animate-spin">⚡</span>
          </div>
        </div>
      )}

      {/* 2. Active Storm Visual & Proximity Status (15s duration) */}
      {stormState === 'active' && (
        <>
          {/* Mild red-orange storm atmosphere flicker overlay */}
          <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
            {/* Mild pulsing warm red-orange radiation haze */}
            <div className="absolute inset-0 bg-red-600/25 mix-blend-color-burn animate-pulse transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-amber-500/15 mix-blend-screen animate-pulse" />
          </div>

          {/* Storm status banner with rover shelter status */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-2">
            <div className="bg-red-950/90 border-2 border-red-500 text-white px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
              <span className="text-xl">🚨</span>
              <span className="font-bold text-sm tracking-wide">
                {stormLevel === 'strong' ? 'Strong' : 'Minor'} Radiation Storm Active
              </span>
            </div>

            {/* Rover Sheltered vs Exposed Indicator */}
            {isRoverSheltered ? (
              <div className="bg-emerald-600/90 border border-emerald-300 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Rover safe at base</span>
              </div>
            ) : (
              <div className="bg-amber-600/95 border-2 border-amber-300 text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-xl animate-bounce flex items-center gap-1.5">
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

