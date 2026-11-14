import { useGameStore } from '../store/gameStore'
import { STORM_WARNING_SEC } from '../config/gameConfig'
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
  const shieldToday = useGameStore((s) => s.shieldToday)
  const isRoverSheltered = useGameStore((s) => s.isRoverSheltered)
  const dayPhase = useGameStore((s) => s.dayPhase)

  if (!isGameStarted || dayPhase === 'morning' || dayPhase === 'ended') {
    return null
  }

  const warningPct = Math.max(
    0,
    Math.min(100, (stormCountdown / (STORM_WARNING_SEC || 10)) * 100)
  )

  return (
    <>
      {/* 1. Countdown Warning Card (10s before storm) — Centered directly below Day X of 20 card */}
      {stormState === 'warning' && (
        <div className="fixed inset-x-0 top-[5.4rem] md:top-[8.85rem] z-30 pointer-events-none flex justify-center px-3">
          <div className="w-[92vw] max-w-[300px] md:w-[272px] lg:w-80 md:max-w-none hud-glass border border-amber-400/65 rounded-2xl p-3 shadow-[0_12px_32px_rgba(245,158,11,0.28)] flex flex-col gap-2 relative overflow-hidden animate-fade-in">
            {/* Top Hazard Accent Line */}
            <div
              className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500"
              aria-hidden="true"
            />

            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 flex-shrink-0 animate-pulse">
                  <ZapBoltIcon size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold leading-none">
                    Solar Storm Warning
                  </span>
                  <span className="font-display text-xs lg:text-[13px] font-bold text-white truncate mt-0.5">
                    Radiation wave inbound
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-400/50 font-mono text-xs font-extrabold text-rose-200 flex-shrink-0">
                {stormCountdown}s
              </span>
            </div>

            {/* Countdown Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.08]">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-300"
                style={{ width: `${warningPct}%` }}
              />
            </div>

            {/* Shelter Status Strip */}
            <div
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 ${
                isRoverSheltered
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                  : 'bg-amber-500/15 border-amber-400/40 text-amber-200'
              }`}
            >
              {isRoverSheltered ? (
                <>
                  <ShieldDefenseIcon size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>Rover safe inside base shield</span>
                </>
              ) : (
                <>
                  <AlertTriangleIcon size={13} className="text-amber-300 flex-shrink-0" />
                  <span>Drive to base shield before impact!</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Storm Telemetry Card (15s duration) — Centered directly below Day X of 20 card */}
      {stormState === 'active' && (
        <div className="fixed inset-x-0 top-[5.4rem] md:top-[8.85rem] z-30 pointer-events-none flex justify-center px-3">
          <div className="w-[92vw] max-w-[300px] md:w-[272px] lg:w-80 md:max-w-none hud-glass border border-rose-500/75 rounded-2xl p-3 shadow-[0_12px_36px_rgba(244,63,94,0.35)] flex flex-col gap-2 relative overflow-hidden animate-fade-in">
            {/* Top Crimson Hazard Line */}
            <div
              className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500"
              aria-hidden="true"
            />

            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-300 flex-shrink-0 animate-pulse">
                  <AlertTriangleIcon size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-rose-300 font-bold leading-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    Radiation Alert
                  </span>
                  <span className="font-display text-xs lg:text-[13px] font-bold text-white truncate mt-0.5">
                    {stormLevel === 'strong' ? 'Strong' : 'Minor'} Storm Active
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40 font-mono text-[10px] font-bold text-purple-200 flex-shrink-0">
                SHIELD {shieldToday}%
              </span>
            </div>

            {/* Rover Sheltered vs Exposed Integrated Status Bar */}
            {isRoverSheltered ? (
              <div className="bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 font-display font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5">
                <ShieldDefenseIcon size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Rover safe at base</span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-600/90 border border-amber-300/80 text-white font-display font-bold text-xs px-3 py-1.5 rounded-xl shadow-[0_0_16px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 animate-pulse">
                <AlertTriangleIcon size={14} className="text-amber-100 flex-shrink-0" />
                <span>Rover exposed! Drive home!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
