import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  TOTAL_POWER_BUDGET,
  BASE_ROVER_CAPACITY,
  ROVER_CAPACITY_PER_POINT,
  AIR_DAILY_DROP,
  AIR_REFILL_MULTIPLIER,
  ROVER_STORM_PENALTY,
} from '../config/balance'

function formatDonkiDate(dateStr: string): string {
  if (!dateStr || dateStr.startsWith('Simulated')) return dateStr
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    if (!y || !m || !d) return dateStr
    return `${d} ${months[m - 1]} ${y}`
  } catch {
    return dateStr
  }
}

export default function MorningScreen() {
  const [showRadiationWhy, setShowRadiationWhy] = useState(false)
  const [showFlareWhy, setShowFlareWhy] = useState(false)

  const day = useGameStore((s) => s.day)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)

  const isLoadingSpaceWeather = useGameStore((s) => s.isLoadingSpaceWeather)
  const spaceWeatherSource = useGameStore((s) => s.spaceWeatherSource)
  const stormLevelToday = useGameStore((s) => s.stormLevelToday)
  const stormDateToday = useGameStore((s) => s.stormDateToday)
  const stormEventsToday = useGameStore((s) => s.stormEventsToday)
  const loadSpaceWeather = useGameStore((s) => s.loadSpaceWeather)

  const roverPenaltyNextDay = useGameStore((s) => s.roverStormPenaltyNextDay)
  const powerSplit = useGameStore((s) => s.powerSplit)
  const setPowerAlloc = useGameStore((s) => s.setPowerAlloc)
  const startDrivingDay = useGameStore((s) => s.startDrivingDay)

  // Trigger loading NASA data on mount if not yet loaded
  useEffect(() => {
    if (isLoadingSpaceWeather) {
      loadSpaceWeather()
    }
  }, [isLoadingSpaceWeather, loadSpaceWeather])

  if (dayPhase !== 'morning' || isMissionComplete || isAirDepleted || isCrewDepleted) {
    return null
  }

  // 1. Loading Skeleton / Spinner State (Stage 5)
  if (isLoadingSpaceWeather) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto select-none">
        <div className="bg-slate-900 border-2 border-orange-500/50 rounded-3xl max-w-sm w-full p-8 text-white shadow-2xl flex flex-col items-center text-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-2" />
          <h2 className="text-xl font-bold tracking-wide text-orange-400">
            Contacting NASA...
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fetching real solar flare and space weather observations from NASA DONKI.
          </p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    )
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

  // NASA source badge
  const sourceBadgeConfig = {
    live: {
      label: 'Live NASA data',
      className: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    },
    saved: {
      label: 'Saved NASA data',
      className: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
    },
    simulated: {
      label: 'Simulated',
      className: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    },
  }[spaceWeatherSource]

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

  const hasSolarFlare = stormEventsToday.some((e) => e.toLowerCase().includes('solar flare'))

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
      <div className="bg-slate-900/95 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-3.5 my-auto">
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

        {/* Space Weather Report Card (Stage 4 & 5) */}
        <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>📡</span>
                <span>Space weather today</span>
              </span>
              {/* NASA Source Badge */}
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${sourceBadgeConfig.className}`}
              >
                {sourceBadgeConfig.label}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1 ${weatherConfig.badgeColor}`}
            >
              <span>{weatherConfig.icon}</span>
              <span>{weatherConfig.label}</span>
            </span>
          </div>

          {/* Replay Real Date Label */}
          <div className="text-[11px] text-orange-300/90 font-medium">
            {spaceWeatherSource === 'simulated'
              ? 'Replaying simulated space weather profile'
              : `Replaying real space weather from ${formatDonkiDate(stormDateToday)}`}
          </div>

          {/* Forecast Description */}
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
                  onClick={() => setShowRadiationWhy((v) => !v)}
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

          {/* Real Events List from NASA */}
          <div className="mt-0.5 bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/60 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold text-[10px] uppercase">
                Recorded NASA Observations
              </span>
              {hasSolarFlare && (
                <button
                  type="button"
                  onClick={() => setShowFlareWhy((v) => !v)}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>What is a solar flare?</span>
                </button>
              )}
            </div>
            <div className="text-slate-200 flex flex-wrap gap-1.5">
              {stormEventsToday.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-slate-800/90 px-2 py-0.5 rounded-lg border border-slate-700 font-mono text-[11px]"
                >
                  <span>⚡</span>
                  <span>{ev}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Radiation "Why?" Popup */}
          {showRadiationWhy && (
            <div className="mt-1 bg-blue-950/95 border border-blue-400/50 rounded-xl p-3 text-xs text-sky-200 shadow-xl flex flex-col gap-2 animate-fade-in">
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

          {/* Solar Flare "Why?" Popup */}
          {showFlareWhy && (
            <div className="mt-1 bg-blue-950/95 border border-blue-400/50 rounded-xl p-3 text-xs text-sky-200 shadow-xl flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 flex items-center gap-1">
                  <span>☀️</span> About Solar Flares
                </span>
                <button
                  onClick={() => setShowFlareWhy(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                A solar flare is a sudden flash of energy from the Sun.
              </p>
            </div>
          )}
        </div>

        {/* Sliders Container */}
        <div className="flex flex-col gap-2.5">
          {sliders.map((s) => (
            <div
              key={s.key}
              className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 flex flex-col gap-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
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
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-950/50 text-center text-base tracking-wide flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Start driving</span>
        </button>
      </div>
    </div>
  )
}
