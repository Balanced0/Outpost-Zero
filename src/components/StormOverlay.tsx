import { useGameStore } from '../store/gameStore'
import {
  AlertTriangleIcon,
  ShieldDefenseIcon,
  ZapBoltIcon,
} from './icons/MissionIcons'

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
        <div className="fixed top-16 sm:top-40 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[92vw] max-w-sm flex justify-center animate-fade-in">
          <div className="bg-gradient-to-r from-rose-950/95 via-red-900/95 to-rose-950/95 border border-amber-400/70 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.45)] flex items-center justify-between gap-3 backdrop-blur-md w-full">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/50 flex items-center justify-center text-amber-300 flex-shrink-0 animate-pulse">
              <ZapBoltIcon size={18} />
            </div>
            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold truncate">
                Solar Storm Warning
              </span>
              <span className="font-display text-sm sm:text-base font-bold text-white">
                Radiation arrives in {stormCountdown}s
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/50 flex items-center justify-center text-amber-300 flex-shrink-0 animate-pulse">
              <AlertTriangleIcon size={18} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Storm Visual & Proximity Status (15s duration) */}
      {stormState === 'active' && (
        <div className="fixed top-16 sm:top-40 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1.5 w-[92vw] max-w-sm animate-fade-in">
          <div className="bg-rose-950/95 border border-rose-500/80 text-white px-4 py-2 rounded-2xl shadow-[0_0_28px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 backdrop-blur-md w-full text-center">
            <AlertTriangleIcon size={16} className="text-rose-400 flex-shrink-0 animate-pulse" />
            <span className="font-display font-bold text-xs sm:text-sm tracking-wide">
              {stormLevel === 'strong' ? 'Strong' : 'Minor'} Radiation Storm Active
            </span>
          </div>

          {/* Rover Sheltered vs Exposed Indicator */}
          {isRoverSheltered ? (
            <div className="bg-emerald-950/95 border border-emerald-400/60 text-emerald-200 font-mono font-bold text-xs px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <ShieldDefenseIcon size={14} className="text-emerald-400" />
              <span>Rover safe inside base shield</span>
            </div>
          ) : (
            <div className="bg-amber-600/95 border border-amber-300 text-white font-display font-bold text-xs px-4 py-1.5 rounded-full shadow-xl animate-bounce flex items-center gap-1.5">
              <AlertTriangleIcon size={14} />
              <span>Rover exposed! Drive home!</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
