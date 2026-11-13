import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'
import { BASE_SAFE_DISTANCE, SUNSET_WARN_SEC } from '../config/gameConfig'
import { PLANETS } from '../config/planets'
import { DIFFICULTIES } from '../config/difficulty'
import WhyButton from './WhyButton'

export default function HUD() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const commanderName = useGameStore((s) => s.commanderName)
  const planet = useGameStore((s) => s.planet)
  const difficulty = useGameStore((s) => s.difficulty)

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
  const discoverySpots = useGameStore((s) => s.discoverySpots)
  const nearbySpot = useGameStore((s) => s.nearbySpot)
  const activeScan = useGameStore((s) => s.activeScan)
  const scanError = useGameStore((s) => s.scanError)
  const startScan = useGameStore((s) => s.startScan)

  // Stage 7A Call Earth Comms
  const callEarthState = useGameStore((s) => s.callEarthState)
  const callEarthCountdown = useGameStore((s) => s.callEarthCountdown)
  const callEarthMessage = useGameStore((s) => s.callEarthMessage)
  const startCallEarth = useGameStore((s) => s.startCallEarth)
  const dismissCallEarthReply = useGameStore((s) => s.dismissCallEarthReply)

  if (!isGameStarted) {
    return null
  }

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

  // Arrow angle to base: atan2 gives angle from positive-x axis; offset by +90 because ↑ points up
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

  // Explorer Mode: Find nearest undiscovered spot & angle
  const hasHints = DIFFICULTIES[difficulty].hasHints
  let nearestUndiscoveredSpot = null
  let nearestSpotDist = Infinity
  let nearestSpotAngleDeg = 0

  if (hasHints) {
    const uncollected = discoverySpots.filter((s) => !s.collected)
    for (const s of uncollected) {
      const d = Math.hypot(s.x - roverX, s.y - roverY)
      if (d < nearestSpotDist) {
        nearestSpotDist = d
        nearestUndiscoveredSpot = s
      }
    }
    if (nearestUndiscoveredSpot) {
      const sx = nearestUndiscoveredSpot.x - roverX
      const sy = nearestUndiscoveredSpot.y - roverY
      nearestSpotAngleDeg = (Math.atan2(sy, sx) * 180) / Math.PI + 90
    }
  }

  return (
    <>
      {/* HUD overlay — pointer-events: none so Phaser receives game input */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top-left: Battery, Compass, Discoveries & Comms */}
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

          {/* C) Discoveries Score & Goal (Stage 6 & 7B) */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex flex-col gap-1 w-52 border border-white/10 shadow-lg pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span>💎</span>
                <span>Discoveries</span>
                <WhyButton term="scan" />
              </div>
              <div className="font-mono text-xs font-bold text-amber-300">
                {totalDiscoveryPoints} pts
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5 border-t border-white/10">
              <span className="font-mono">
                Goal: {totalDiscoveryPoints} / {DIFFICULTIES[difficulty].discoveryGoal} points
              </span>
              {totalDiscoveryPoints >= DIFFICULTIES[difficulty].discoveryGoal && (
                <span className="text-emerald-400 font-bold">✓ Met</span>
              )}
            </div>
          </div>

          {/* D) Call Earth (Stage 7A) */}
          {dayPhase !== 'morning' && dayPhase !== 'ended' && (
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between w-52 border border-white/10 shadow-lg pointer-events-auto">
              {callEarthState === 'idle' ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={startCallEarth}
                    disabled={battery < 5}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                    title="Send a message to NASA Mission Control (costs 5 battery)"
                  >
                    <span>📡</span>
                    <span>Call Earth (-5 🔋)</span>
                  </button>
                  <WhyButton term="comms delay" />
                </div>
              ) : callEarthState === 'calling' ? (
                <div className="flex items-center justify-between w-full text-xs text-sky-300 animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                    <span className="font-mono font-bold text-[11px]">
                      Waiting... {Math.ceil(callEarthCountdown)}s
                    </span>
                  </div>
                  <WhyButton term="comms delay" />
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>📩</span> Reply received!
                  </span>
                  <button
                    onClick={dismissCallEarthReply}
                    className="text-[10px] text-slate-300 underline font-mono cursor-pointer"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* E) Explorer Mode Hint Arrow (Stage 7A) */}
          {hasHints && nearestUndiscoveredSpot && dayPhase !== 'morning' && (
            <div className="bg-emerald-950/80 backdrop-blur-sm border border-emerald-500/50 rounded-xl px-2.5 py-1.5 flex items-center gap-2 w-52 shadow-lg pointer-events-auto">
              <div
                className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-xs text-emerald-300 font-bold transition-transform duration-100 flex-shrink-0"
                style={{ transform: `rotate(${nearestSpotAngleDeg}deg)` }}
              >
                ↑
              </div>
              <div className="flex flex-col text-[10px] leading-tight overflow-hidden">
                <span className="text-emerald-400 font-bold truncate">
                  Nearest: {nearestUndiscoveredSpot.name}
                </span>
                <span className="text-emerald-300/80 font-mono">
                  {Math.round(nearestSpotDist)} m away
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top-center: Day Timer, Sun bar, & Mission/Difficulty Badges */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-2.5 flex flex-col items-center min-w-[240px] shadow-xl pointer-events-auto">
            {/* Mission badge & Planet info */}
            <div className="flex items-center justify-between w-full text-[10px] text-slate-400 mb-1 border-b border-white/10 pb-1">
              <span className="font-semibold text-slate-200">
                {planet === 'mars' ? '🔴 Mars' : '⚪ Moon'} • {commanderName}
              </span>
              <span
                className={`px-2 py-0.2 rounded-full border text-[9px] font-bold ${DIFFICULTIES[difficulty].badgeColor}`}
              >
                {DIFFICULTIES[difficulty].name}
              </span>
            </div>

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
              <span>{planet === 'moon' ? '🌑 Night' : '🌇 Sunset'}</span>
            </div>
          </div>

          {/* Sunset Alert Banner */}
          {isSunsetWarning && (
            <div className="animate-bounce bg-red-600/90 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-red-400/50 shadow-lg flex items-center gap-1.5 backdrop-blur-sm pointer-events-auto">
              <span>⚠️</span>
              <span>{planet === 'moon' ? 'Night soon! Head home.' : 'Sunset soon! Head home.'}</span>
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

          {/* 3. Crew Health Meter */}
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
            {activeScan ? (
              <div className="bg-black/85 backdrop-blur-md border-2 border-cyan-400 rounded-2xl px-6 py-3.5 shadow-2xl flex flex-col items-center min-w-[260px] text-center">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1.5 animate-pulse">
                  <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>Scanning Discovery... {(activeScan.duration - activeScan.elapsed).toFixed(1)}s</span>
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

      {/* Incoming Earth Transmission Modal (Stage 7A) */}
      {callEarthState === 'received' && callEarthMessage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto animate-fade-in select-none">
          <div className="bg-slate-900 border-2 border-sky-400 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl flex flex-col gap-3.5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-xl">
                  📡
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
                    NASA Mission Control
                  </span>
                  <h3 className="font-bold text-base text-slate-100">
                    Incoming Transmission
                  </h3>
                </div>
              </div>
              <WhyButton term="comms delay" />
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-sky-200 leading-relaxed font-mono">
              {callEarthMessage}
            </div>

            <div className="text-[11px] text-slate-400 leading-snug">
              <span className="text-slate-300 font-semibold">NASA Comms Note: </span>
              Radio messages travel at light speed, but distance creates delay ({planet === 'mars' ? 'scaled from 4–24 min' : 'scaled from ~1.3s'}). By the time Earth responds, you may already be in the storm!
            </div>

            <button
              type="button"
              onClick={dismissCallEarthReply}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-sky-950/50"
            >
              Acknowledge Transmission
            </button>
          </div>
        </div>
      )}

      {/* Power-off overlay */}
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
