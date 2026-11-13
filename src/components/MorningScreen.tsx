import { useGameStore } from '../store/gameStore'
import {
  TOTAL_POWER_BUDGET,
  BASE_ROVER_CAPACITY,
  ROVER_CAPACITY_PER_POINT,
  AIR_DAILY_DROP,
  AIR_REFILL_MULTIPLIER,
} from '../config/balance'

export default function MorningScreen() {
  const day = useGameStore((s) => s.day)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const powerSplit = useGameStore((s) => s.powerSplit)
  const setPowerAlloc = useGameStore((s) => s.setPowerAlloc)
  const startDrivingDay = useGameStore((s) => s.startDrivingDay)

  if (dayPhase !== 'morning' || isMissionComplete || isAirDepleted) {
    return null
  }

  const totalUsed = powerSplit.air + powerSplit.shield + powerSplit.rover
  const powerLeft = Math.max(0, TOTAL_POWER_BUDGET - totalUsed)

  // Projected stats
  const projectedCapacity = Math.round(
    BASE_ROVER_CAPACITY + powerSplit.rover * ROVER_CAPACITY_PER_POINT
  )
  const projectedAirRefill = (powerSplit.air * AIR_REFILL_MULTIPLIER).toFixed(1)
  const airNetChange = (
    powerSplit.air * AIR_REFILL_MULTIPLIER -
    AIR_DAILY_DROP
  ).toFixed(1)
  const isAirPositive = Number(airNetChange) >= 0

  const sliders = [
    {
      key: 'air' as const,
      label: 'Air machine',
      icon: '🫁',
      value: powerSplit.air,
      description: 'Keeps the astronauts breathing.',
      accent: 'from-cyan-500 to-blue-500',
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
      accent: 'from-indigo-500 to-purple-500',
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
      accent: 'from-amber-500 to-orange-500',
      trackColor: 'accent-orange-400',
      statLabel: `Battery capacity: ${projectedCapacity} units`,
      statColor: 'text-amber-300',
    },
  ]

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto select-none animate-fade-in">
      <div className="bg-slate-900/95 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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

        {/* Sliders Container */}
        <div className="flex flex-col gap-4">
          {sliders.map((s) => (
            <div
              key={s.key}
              className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-bold text-sm text-slate-100">{s.label}</span>
                </div>

                {/* Number display with +/- buttons for easy tuning */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 rounded-xl px-2 py-1">
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

              {/* Slider track */}
              <input
                type="range"
                min="0"
                max={TOTAL_POWER_BUDGET}
                value={s.value}
                onChange={(e) => setPowerAlloc(s.key, Number(e.target.value))}
                className={`w-full h-2.5 bg-slate-700 rounded-lg cursor-pointer ${s.trackColor}`}
              />

              {/* Kid-friendly description & live stat */}
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
          className="w-full py-4 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-950/50 text-center text-base tracking-wide flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Start driving</span>
        </button>
      </div>
    </div>
  )
}

