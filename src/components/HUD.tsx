import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'
import { BASE_SAFE_DISTANCE, SUNSET_WARN_SEC } from '../config/gameConfig'
import WhyButton from './WhyButton'

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

  // Base survival meters (Stage 3 & 4)
  const air = useGameStore((s) => s.air)
  const shieldToday = useGameStore((s) => s.shieldToday)
  const crewHealth = useGameStore((s) => s.crewHealth)

  // Stage 6 Discoveries & Scan state
  const totalDiscoveryPoints = useGameStore((s) => s.totalDiscoveryPoints)
  const nearbySpot = useGameStore((s) => s.nearbySpot)
  const activeScan = useGameStore((s) => s.activeScan)
  const scanError = useGameStore((s) => s.scanError)
  const startScan = useGameStore((s) => s.startScan)

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

  // Crew health meter color change
  const healthColor =
    crewHealth > 50 ? 'bg-emerald-500' : crewHealth >= 20 ? 'bg-yellow-400' : 'bg-red-500'
  const healthTextColor =
    crewHealth > 50 ? 'text-emerald-400' : crewHealth >= 20 ? 'text-yellow-400' : 'text-red-400'

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
  const isSunsetWarning =
    timeLeft <= SUNSET_WARN_SEC && dayPhase !== 'ended' && dayPhase !== 'morning'

  // Active scan progress
  const scanProgressPercent = activeScan
    ? Math.min(100, (activeScan.elapsed / activeScan.duration) * 100)
    : 0

  return (
    <>
      {/* HUD overlay — pointer-events: none so Phaser receives game input */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top-left: Battery, Compass & Discoveries */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* A) Battery gauge with today's capacity */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 w-52 border border-white/10 shadow-lg pointer-events-auto">
            <div className="text-white text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>🔋 Rover Battery</span>
                <WhyButton term="rover battery" />
              </span>
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

          {/* C) Discoveries Score (Stage 6) */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between w-52 border border-white/10 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span>💎</span>
              <span>Discoveries</span>
              <WhyButton term="scan" />
            </div>
            <div className="font-mono text-xs font-bold text-amber-300">
              {totalDiscoveryPoints} pts
            </div>
          </div>
        </div>

        {/* Top-center: Day Timer & Sun bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[240px] shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between w-full text-xs font-bold text-white mb-1.5">
              <span className="text-orange-400 tracking-wide">
                Day {day} of {maxDays}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-gray-300">
                  {dayPhase === 'morning' ? 'Planning' : `${Math.ceil(timeLeft)}s left`}
                </span>
                <WhyButton term="sunset" />
              </div>
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
            <div className="animate-bounce bg-red-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-red-400/50 shadow-lg flex items-center gap-1.5 backdrop-blur-sm pointer-events-auto">
              <span>⚠️</span>
              <span>Sunset soon! Head home.</span>
            </div>
          )}
        </div>

        {/* Top-right: Base Survival Meters (Air, Shield, Crew health) */}
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
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between w-48 border border-white/10 shadow-lg pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="text-sm">🛡️</span>
              <span>Shield</span>
              <WhyButton term="shield" />
            </div>
            <div className="font-mono text-xs font-bold text-purple-300">
              {shieldToday}%
            </div>
          </div>

          {/* 3. Crew Health Meter (Stage 4) */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 w-48 border border-white/10 shadow-lg pointer-events-auto">
            <div className="text-white text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>❤️</span>
                <span>Crew Health</span>
                <WhyButton term="radiation" />
              </span>
              <span className={`font-mono text-[11px] font-bold ${healthTextColor}`}>
                {Math.round(crewHealth)}%
              </span>
            </div>
            <div className="relative w-full h-3 bg-gray-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${healthColor}`}
                style={{ width: `${Math.max(0, Math.min(100, crewHealth))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Interactive Discovery & Scanning Prompt (Stage 6) */}
        {nearbySpot && dayPhase !== 'morning' && dayPhase !== 'ended' && !isPoweredOff && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto animate-fade-in z-30">
            {/* Active Scanning Progress Ring / Bar */}
            {activeScan ? (
              <div className="bg-black/85 backdrop-blur-md border-2 border-cyan-400 rounded-2xl px-6 py-3.5 shadow-2xl flex flex-col items-center min-w-[260px] text-center">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1.5 animate-pulse">
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>Scanning Discovery... {((activeScan.duration - activeScan.elapsed)).toFixed(1)}s</span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-100"
                    style={{ width: `${scanProgressPercent}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-300 mt-1.5 font-medium">
                  Stay still! Moving cancels scan.
                </span>
              </div>
            ) : (
              /* Ready to Scan Button & Instructions */
              <div className="flex flex-col items-center gap-1.5">
                {scanError && (
                  <div className="bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                    ⚠️ {scanError}
                  </div>
                )}

                <div className="bg-black/85 backdrop-blur-md border border-amber-400/80 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3">
                  <button
                    onClick={() => startScan()}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-white font-extrabold text-sm rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>🔬</span>
                    <span>Scan {nearbySpot.type === 'rock' ? 'Rock' : nearbySpot.type === 'riverbed' ? 'Riverbed' : 'Ice'}</span>
                    <span className="bg-black/30 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      -{nearbySpot.batteryCost} 🔋
                    </span>
                  </button>

                  <div className="hidden sm:flex flex-col text-left pr-2 text-xs text-slate-300">
                    <span className="text-white font-bold">
                      +{nearbySpot.points} {nearbySpot.points === 1 ? 'Point' : 'Points'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Press <kbd className="bg-slate-700 px-1 rounded text-white font-mono">SPACE</kbd> or tap button
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* C) Power-off overlay — only when rover ran out of battery during daytime */}
      {isPoweredOff &&
        dayPhase !== 'ended' &&
        dayPhase !== 'morning' &&
        !isMissionComplete && (
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
