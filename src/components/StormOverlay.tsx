import { useGameStore } from '../store/gameStore'
import { STORM_WARNING_SEC } from '../config/gameConfig'
import {
  AlertTriangleIcon,
  ShieldDefenseIcon,
  ZapBoltIcon,
} from './icons/MissionIcons'

/**
 * StormAlertCard — Rendered directly inside HUD's top-center flex column
 * immediately underneath the "Day X of 20" black telemetry card so it is
 * always horizontally centered and stacked right below it.
 */
export function StormAlertCard() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const stormState = useGameStore((s) => s.stormState)
  const stormCountdown = useGameStore((s) => s.stormCountdown)
  const stormLevel = useGameStore((s) => s.stormLevelToday)
  const shieldToday = useGameStore((s) => s.shieldToday)
  const isRoverSheltered = useGameStore((s) => s.isRoverSheltered)
  const dayPhase = useGameStore((s) => s.dayPhase)

  if (
    !isGameStarted ||
    dayPhase === 'morning' ||
    dayPhase === 'ended' ||
    (stormState !== 'warning' && stormState !== 'active')
  ) {
    return null
  }

  const warningPct = Math.max(
    0,
    Math.min(100, (stormCountdown / (STORM_WARNING_SEC || 10)) * 100)
  )

  if (stormState === 'warning') {
    return (
      <div className="w-[92vw] max-w-[300px] md:w-[272px] lg:w-80 md:max-w-none hud-glass border border-amber-400/75 rounded-2xl p-3 shadow-[0_14px_38px_rgba(245,158,11,0.32)] flex flex-col gap-2 relative overflow-hidden pointer-events-auto animate-fade-in">
        {/* Glossy Shimmer Sweep */}
        <div
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent animate-shimmer pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Hazard Accent Line */}
        <div
          className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500"
          aria-hidden="true"
        />

        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              <span className="absolute inset-0 rounded-xl border border-amber-400/60 animate-pulse-ring" />
              <ZapBoltIcon size={15} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold leading-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Solar Storm Warning
              </span>
              <span className="font-display text-xs lg:text-[13px] font-bold text-white truncate mt-0.5">
                Radiation wave inbound
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-rose-500/25 border border-rose-400/60 font-mono text-xs font-extrabold text-rose-200 flex-shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            {stormCountdown}s
          </span>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full h-1.5 bg-slate-950/90 rounded-full overflow-hidden border border-white/[0.1] relative z-10">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            style={{ width: `${warningPct}%` }}
          />
        </div>

        {/* Shelter Status Strip */}
        <div
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-display font-bold flex items-center justify-center gap-1.5 relative z-10 ${
            isRoverSheltered
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-amber-500/20 border-amber-400/50 text-amber-100'
          }`}
        >
          {isRoverSheltered ? (
            <>
              <ShieldDefenseIcon size={13} className="text-emerald-400 flex-shrink-0" />
              <span>Rover safe inside base shield</span>
            </>
          ) : (
            <>
              <AlertTriangleIcon size={13} className="text-amber-300 flex-shrink-0 animate-bounce" />
              <span>Drive to base shield before impact!</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-[92vw] max-w-[300px] md:w-[272px] lg:w-80 md:max-w-none hud-glass border border-rose-500/80 rounded-2xl p-3 shadow-[0_16px_42px_rgba(244,63,94,0.4)] flex flex-col gap-2 relative overflow-hidden pointer-events-auto animate-fade-in">
      {/* Glossy Shimmer Sweep */}
      <div
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-rose-400/12 to-transparent animate-shimmer pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Crimson Hazard Line */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500"
        aria-hidden="true"
      />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-8 h-8 rounded-xl bg-rose-500/25 border border-rose-400/60 flex items-center justify-center text-rose-300 flex-shrink-0 shadow-[0_0_16px_rgba(244,63,94,0.4)]">
            <span className="absolute inset-0 rounded-xl border border-rose-400/60 animate-pulse-ring" />
            <AlertTriangleIcon size={15} />
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

        <span className="px-2 py-0.5 rounded-lg bg-purple-500/25 border border-purple-400/50 font-mono text-[10px] font-bold text-purple-200 flex-shrink-0">
          SHIELD {shieldToday}%
        </span>
      </div>

      {/* Rover Sheltered vs Exposed Integrated Status Bar */}
      {isRoverSheltered ? (
        <div className="bg-emerald-950/85 border border-emerald-400/55 text-emerald-200 font-display font-bold text-xs px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 relative z-10">
          <ShieldDefenseIcon size={14} className="text-emerald-400 flex-shrink-0" />
          <span>Rover safe at base</span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-600/95 via-orange-500/95 to-amber-600/95 border border-amber-300/90 text-white font-display font-bold text-xs px-3 py-1.5 rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.45)] flex items-center justify-center gap-1.5 animate-pulse relative z-10">
          <AlertTriangleIcon size={14} className="text-amber-100 flex-shrink-0" />
          <span>Rover exposed! Drive home!</span>
        </div>
      )}
    </div>
  )
}

export default function StormOverlay() {
  // StormAlertCard is rendered directly inside HUD's top-center stack right below the Day X of 20 card
  return null
}
