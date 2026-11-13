import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  TOTAL_POWER_BUDGET,
  BASE_ROVER_CAPACITY,
  ROVER_CAPACITY_PER_POINT,
  AIR_DAILY_DROP,
  AIR_REFILL_MULTIPLIER,
  ROVER_STORM_PENALTY,
} from '../config/balance'

export default function MorningScreen() {
  const [showRadiationWhy, setShowRadiationWhy] = useState(false)

  const day = useGameStore((s) => s.day)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const stormLevelToday = useGameStore((s) => s.stormLevelToday)
  const roverPenaltyNextDay = useGameStore((s) => s.roverStormPenaltyNextDay)
  const powerSplit = useGameStore((s) => s.powerSplit)
  const setPowerAlloc = useGameStore((s) => s.setPowerAlloc)
  const startDrivingDay = useGameStore((s) => s.startDrivingDay)

  if (dayPhase !== 'morning' || isMissionComplete || isAirDepleted || isCrewDepleted) {
    return null
  }

  const totalUsed = powerSplit.air + powerSplit.shield + powerSplit.rover
  const powerLeft = Math.max(0, TOTAL_POWER_BUDGET - totalUsed)

  // Projected stats
  const rawCapacity = BASE_ROVER_CAPACITY + powerSplit.rover * ROVER_CAPACITY_PER_POINT
  const projectedCapacity = Math.max(
    20,
    Math.round(rawCapacity - (roverPenaltyNextDay ? ROVER_STORM_PENALTY : 0))
  )
  const projectedAirRefill = (powerSplit.air * AIR_REFILL_MULTIPLIER).toFixed(1)
  const airNetChange = (
    powerSplit.air * AIR_REFILL_MULTIPLIER -
    AIR_DAILY_DROP
  ).toFixed(1)
  const isAirPositive = Number(airNetChange) >= 0

  // Space weather config
  const weatherConfig = {
    none: {
      label: 'Calm',
      icon: '☀️',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      description: 'The Sun is quiet today.',
      hasRadiationWord: false,
    },
    minor: {
      label: 'Minor storm',
      icon: '⚠️',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
      description: 'A small burst of radiation is coming. Shield up a little.',
      hasRadiationWord: true,
    },
    strong: {
      label: 'Strong storm',
      icon: '🚨',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-400/40',
      description: 'A big radiation burst is coming. The crew needs strong shields!',
      hasRadiationWord: true,
    },
  }[stormLevelToday]

  const sliders = [
    {
      key: 'air' as const,
      label: 'Air machine',
      icon: '🫁',
      value: powerSplit.air,
      description: 'Keeps the astronauts breathing.',
      trackColor: 'accent-cyan-400',
      statLabel: `Refill: +${projectedAirRefill}% (${isAirPositive ? '+' : ''}${airNetChange}% net / day)`,
      statColor: isAirPositive ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      key: 'shield' as const,
      label: 'Shield',
      icon: '🛡️',
      value: powerSplit.shield,
      description: 'Protects the base from radiation. (Storms are coming soon!)',
      trackColor: 'accent-purple-400',
      statLabel: `Defense strength: ${powerSplit.shield}%`,
      statColor: 'text-purple-300',
    },
    {
      key: 'rover' as const,
      label: 'Rover',
      icon: '🚗',
      value: powerSplit.rover,
      description: 'More power means a bigger battery for exploring.',
      trackColor: 'accent-orange-400',
      statLabel: `Battery capacity: ${projectedCapacity} units${
        roverPenaltyNextDay ? ' (-30 storm penalty)' : ''
      }`,
      statColor: roverPenaltyNextDay ? 'text-red-400' : 'text-amber-300',
    },
  ]

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto select-none animate-fade-in overflow-y-auto">
      <div className="bg-slate-900/95 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-orange-400 uppercase">
              Outpost Zero • Morning Briefing
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Day {day}: Plan your power
            </h1>
          </div>

          {/* Power Left Pill */}
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-bold font-mono transition-colors ${
              powerLeft > 0
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}
          >
            {powerLeft > 0 ? `⚡ Power left: ${powerLeft}` : '⚡ 100% Allocated'}
          </div>
        </div>

        {/* Space Weather Report Card (Stage 4) */}
        <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📡</span>
              <span>Space weather today</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1 ${weatherConfig.badgeColor}`}
            >
              <span>{weatherConfig.icon}</span>
              <span>{weatherConfig.label}</span>
            </span>
          </div>

          <div className="text-xs text-slate-200 flex items-center flex-wrap gap-1">
            {weatherConfig.hasRadiationWord ? (
              <>
                <span>
                  {stormLevelToday === 'minor'
                    ? 'A small burst of'
                    : 'A big'}
                </span>
                <span className="text-amber-400 font-semibold underline decoration-dotted underline-offset-2">
                  radiation
                </span>
                <button
                  type="button"
                  onClick={() => setShowRadiationWhy(true)}
                  className="px-1.5 py-0.5 bg-blue-600/60 hover:bg-blue-500 text-[10px] font-bold rounded-md text-white border border-blue-400/40 cursor-pointer transition-colors"
                >
                  Why?
                </button>
                <span>
                  {stormLevelToday === 'minor'
                    ? 'is coming. Shield up a little.'
                    : 'burst is coming. The crew needs strong shields!'}
                </span>
              </>
            ) : (
              <span>{weatherConfig.description}</span>
            )}
          </div>

          {/* Radiation "Why?" Popup */}
          {showRadiationWhy && (
            <div className="mt-1 bg-blue-950/90 border border-blue-400/50 rounded-xl p-3 text-xs text-sky-200 shadow-xl flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 flex items-center gap-1">
                  <span>ℹ️</span> About Space Radiation
                </span>
                <button
                  onClick={() => setShowRadiationWhy(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                Radiation is invisible energy from the Sun. Too much can make astronauts sick.
              </p>
            </div>
          )}
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-3">
          {sliders.map((s) => (
            <div
              key={s.key}
              className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className="font-bold text-sm text-slate-100">{s.label}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 rounded-xl px-2 py-0.5">
                  <button
                    onClick={() => setPowerAlloc(s.key, s.value - 1)}
                    disabled={s.value <= 0}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer font-mono font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-white w-8 text-center">
                    {s.value}
                  </span>
                  <button
                    onClick={() => setPowerAlloc(s.key, s.value + 1)}
                    disabled={s.value >= TOTAL_POWER_BUDGET}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max={TOTAL_POWER_BUDGET}
                value={s.value}
                onChange={(e) => setPowerAlloc(s.key, Number(e.target.value))}
                className={`w-full h-2.5 bg-slate-700 rounded-lg cursor-pointer ${s.trackColor}`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <p className="text-slate-400 leading-snug">{s.description}</p>
                <span className={`font-mono font-medium flex-shrink-0 ${s.statColor}`}>
                  {s.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Start Driving Button */}
        <button
          onClick={startDrivingDay}
          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-950/50 text-center text-base tracking-wide flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Start driving</span>
        </button>
      </div>
    </div>
  )
}
