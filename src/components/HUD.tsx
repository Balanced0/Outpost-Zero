import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'
import { BASE_SAFE_DISTANCE, SUNSET_WARN_SEC } from '../config/gameConfig'

export default function HUD() {
  const battery = useGameStore((s) => s.battery)
  const batteryCapacity = useGameStore((s) => s.batteryCapacity)
  const roverX = useGameStore((s) => s.roverX)
  const roverY = useGameStore((s) => s.roverY)
  const isPoweredOff = useGameStore((s) => s.isPoweredOff)
  const setBattery = useGameStore((s) => s.setBattery)
  const setIsPoweredOff = useGameStore((s) => s.setIsPoweredOff)

  const day = useGameStore((s) => s.day)
  const maxDays = useGameStore((s) => s.maxDays)
  const timeLeft = useGameStore((s) => s.timeLeft)
  const dayDuration = useGameStore((s) => s.dayDuration)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)

  // Base survival meters (Stage 3)
  const air = useGameStore((s) => s.air)
  const shieldToday = useGameStore((s) => s.shieldToday)

  // Battery bar percentage & color
  const batteryPercent =
    batteryCapacity > 0 ? (battery / batteryCapacity) * 100 : 0
  const batteryColor =
    batteryPercent > 50
      ? 'bg-green-500'
      : batteryPercent >= 20
      ? 'bg-yellow-400'
      : 'bg-red-500'

  // Air meter color change (green > 50%, yellow 20-50%, red < 20%)
  const airColor =
    air > 50 ? 'bg-cyan-500' : air >= 20 ? 'bg-yellow-400' : 'bg-red-500'
  const airTextColor =
    air > 50 ? 'text-cyan-400' : air >= 20 ? 'text-yellow-400' : 'text-red-400'

  // Distance to base
  const dx = BASE_X - roverX
  const dy = BASE_Y - roverY
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy))
  const isRecharging = distance <= BASE_SAFE_DISTANCE

  // Arrow angle: atan2 gives angle from positive-x axis; offset by +90 because ↑ points up
  const angleRad = Math.atan2(dy, dx)
  const angleDeg = (angleRad * 180) / Math.PI + 90

  // Day progress
  const timePercent = Math.max(0, Math.min(100, (timeLeft / dayDuration) * 100))
  const isSunsetWarning = timeLeft <= SUNSET_WARN_SEC && dayPhase !== 'ended' && dayPhase !== 'morning'

  return (
    <>
      {/* HUD overlay — pointer-events: none so Phaser receives game input */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top-left: Battery & Compass */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* A) Battery gauge with today's capacity */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 w-52 border border-white/10 shadow-lg">
            <div className="text-white text-xs font-semibold mb-1 flex items-center justify-between">
              <span>🔋 Rover Battery</span>
              <span className="font-mono text-[11px] text-gray-300">
                {Math.round(battery)} / {Math.round(batteryCapacity)}
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${batteryColor}`}
                style={{ width: `${Math.max(0, Math.min(100, batteryPercent))}%` }}
              />
            </div>
          </div>

          {/* B) Base direction arrow */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2.5 w-52 border border-white/10 shadow-lg">
            <div
              className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0 text-white text-base leading-none bg-white/5 transition-transform duration-100"
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              ↑
            </div>
            {isRecharging ? (
              <span className="text-emerald-400 text-xs font-bold animate-pulse">
                ⚡ Recharging!
              </span>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Base</span>
                <span className="text-white text-xs font-mono font-bold">{distance} m</span>
              </div>
            )}
          </div>
        </div>

        {/* Top-center: Day Timer & Sun bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[240px] shadow-xl">
            <div className="flex items-center justify-between w-full text-xs font-bold text-white mb-1.5">
              <span className="text-orange-400 tracking-wide">
                Day {day} of {maxDays}
              </span>
              <span className="font-mono text-gray-300">
                {dayPhase === 'morning' ? 'Planning' : `${Math.ceil(timeLeft)}s left`}
              </span>
            </div>

            {/* Sun/Clock Progress Bar */}
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isSunsetWarning
                    ? 'bg-gradient-to-r from-red-500 to-amber-500'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300'
                }`}
                style={{ width: `${dayPhase === 'morning' ? 100 : timePercent}%` }}
              />
            </div>

            {/* Sub-label showing solar status */}
            <div className="flex items-center justify-between w-full text-[10px] text-gray-400 mt-1 font-medium">
              <span>🌅 Morning</span>
              <span>☀️ Midday</span>
              <span>🌇 Sunset</span>
            </div>
          </div>

          {/* Sunset Alert Banner */}
          {isSunsetWarning && (
            <div className="animate-bounce bg-red-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-red-400/50 shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
              <span>⚠️</span>
              <span>Sunset soon! Head home.</span>
            </div>
          )}
        </div>

        {/* Top-right: Base Survival Meters (Stage 3) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* 1. Air Meter */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 w-48 border border-white/10 shadow-lg">
            <div className="text-white text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🫁</span>
                <span>Air Machine</span>
              </span>
              <span className={`font-mono text-[11px] font-bold ${airTextColor}`}>
                {Math.round(air)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${airColor}`}
                style={{ width: `${Math.max(0, Math.min(100, air))}%` }}
              />
            </div>
          </div>

          {/* 2. Shield Strength Meter */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between w-48 border border-white/10 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="text-sm">🛡️</span>
              <span>Shield</span>
            </div>
            <div className="font-mono text-xs font-bold text-purple-300">
              {shieldToday}%
            </div>
          </div>
        </div>
      </div>

      {/* C) Power-off overlay — only when rover ran out of battery during daytime */}
      {isPoweredOff && dayPhase !== 'ended' && dayPhase !== 'morning' && !isMissionComplete && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto select-none p-4 text-center">
          <p className="text-white text-3xl md:text-4xl font-bold mb-3 tracking-wide">
            Rover out of power
          </p>
          <p className="text-gray-300 text-sm md:text-base max-w-sm mb-6">
            The battery reached 0%. Wait for sunset rescue, or tow back to base now.
          </p>
          <button
            onClick={() => {
              setBattery(batteryCapacity)
              setIsPoweredOff(false)
              window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
            }}
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-lg"
          >
            Tow Rover to Base & Recharge
          </button>
        </div>
      )}
    </>
  )
}
