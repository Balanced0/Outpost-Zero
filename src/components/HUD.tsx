import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'
import { BASE_SAFE_DISTANCE, SUNSET_WARN_SEC } from '../config/gameConfig'
import { PLANETS } from '../config/planets'
import { DIFFICULTIES } from '../config/difficulty'
import WhyButton from './WhyButton'
import { sfx } from '../utils/sound'

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
  const openGlossaryCard = useGameStore((s) => s.openGlossaryCard)

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
      {/* ============================================================== */}
      {/* 1. MOBILE COMPACT HUD (screens < 640px, sm:hidden)            */}
      {/* ============================================================== */}
      <div className="sm:hidden">
        {/* A) Single Thin Top Bar: Day, Time bar, Discoveries */}
        <div
          className="fixed top-0 left-0 right-0 z-20 bg-black/85 backdrop-blur-md border-b border-white/10 px-2.5 py-1.5 flex items-center justify-between text-xs pointer-events-auto select-none"
          style={{
            paddingTop: 'max(0.35rem, env(safe-area-inset-top))',
            paddingRight: 'max(6rem, calc(env(safe-area-inset-right) + 5.5rem))', // reserved for sound button
          }}
        >
          {/* Day & Sun bar */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
            <span className="font-extrabold text-orange-400 font-mono text-[11px] whitespace-nowrap">
              D{day}/20
            </span>
            <div className="flex-1 max-w-[90px] h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isSunsetWarning
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300'
                }`}
                style={{ width: `${dayPhase === 'morning' ? 100 : timePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-300 font-mono">
              {dayPhase === 'morning' ? 'Plan' : `${Math.ceil(timeLeft)}s`}
            </span>
          </div>

          {/* Discoveries Score & Goal */}
          <button
            type="button"
            onClick={() => openGlossaryCard('scan')}
            className="flex items-center gap-1 bg-amber-500/15 border border-amber-400/40 rounded-full px-2 py-0.5 text-[11px] font-bold text-amber-300 cursor-pointer flex-shrink-0"
            title="Discoveries (tap to learn more)"
          >
            <span>💎</span>
            <span>{totalDiscoveryPoints} pts</span>
          </button>
        </div>

        {/* B) Floating Icon-Only Meters (Battery, Air, Shield, Crew) */}
        {/* Tap an icon to see its label and ? explanation! */}
        <div
          className="fixed z-20 flex items-center gap-1 pointer-events-auto select-none"
          style={{
            top: 'max(2.6rem, calc(env(safe-area-inset-top) + 2.3rem))',
            left: 'max(0.5rem, env(safe-area-inset-left))',
          }}
        >
          {/* Battery */}
          <button
            type="button"
            onClick={() => {
              sfx('click_soft', { volume: 0.5 })
              openGlossaryCard('rover battery')
            }}
            title="Rover Battery — Tap for explanation"
            className="min-h-[44px] px-2 py-1 bg-black/75 backdrop-blur-sm rounded-xl border border-white/15 flex items-center gap-1 text-[11px] font-mono font-bold text-white shadow-md active:scale-95 cursor-pointer"
          >
            <span>🔋</span>
            <span className={batteryPercent < 20 ? 'text-red-400' : 'text-slate-200'}>
              {Math.round(battery)}
            </span>
          </button>

          {/* Air */}
          <button
            type="button"
            onClick={() => {
              sfx('click_soft', { volume: 0.5 })
              openGlossaryCard('air machine')
            }}
            title="Air Machine — Tap for explanation"
            className="min-h-[44px] px-2 py-1 bg-black/75 backdrop-blur-sm rounded-xl border border-white/15 flex items-center gap-1 text-[11px] font-mono font-bold shadow-md active:scale-95 cursor-pointer"
          >
            <span>🫁</span>
            <span className={airTextColor}>{Math.round(air)}%</span>
          </button>

          {/* Shield */}
          <button
            type="button"
            onClick={() => {
              sfx('click_soft', { volume: 0.5 })
              openGlossaryCard('shield')
            }}
            title="Shield Defense — Tap for explanation"
            className="min-h-[44px] px-2 py-1 bg-black/75 backdrop-blur-sm rounded-xl border border-white/15 flex items-center gap-1 text-[11px] font-mono font-bold text-purple-300 shadow-md active:scale-95 cursor-pointer"
          >
            <span>🛡️</span>
            <span>{shieldToday}%</span>
          </button>

          {/* Crew Health */}
          <button
            type="button"
            onClick={() => {
              sfx('click_soft', { volume: 0.5 })
              openGlossaryCard('radiation')
            }}
            title="Crew Health — Tap for explanation"
            className="min-h-[44px] px-2 py-1 bg-black/75 backdrop-blur-sm rounded-xl border border-white/15 flex items-center gap-1 text-[11px] font-mono font-bold shadow-md active:scale-95 cursor-pointer"
          >
            <span>❤️</span>
            <span className={healthTextColor}>{Math.round(crewHealth)}%</span>
          </button>
        </div>

        {/* C) Base Arrow & Distance as a small round badge */}
        <div
          className="fixed z-20 pointer-events-auto select-none"
          style={{
            top: 'max(2.6rem, calc(env(safe-area-inset-top) + 2.3rem))',
            right: 'max(0.5rem, env(safe-area-inset-right))',
          }}
        >
          <div
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/80 backdrop-blur-sm border-2 shadow-lg flex flex-col items-center justify-center text-white ${
              isRecharging ? 'border-emerald-400 animate-pulse' : 'border-white/30'
            }`}
            title="Base Compass"
          >
            <span
              className="text-xs font-bold leading-none transition-transform duration-100"
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              ↑
            </span>
            <span className="font-mono text-[9px] font-bold leading-none mt-0.5 text-slate-200">
              {isRecharging ? '⚡' : `${distance}m`}
            </span>
          </div>
        </div>

        {/* D) "Call Earth" as a small round button */}
        {dayPhase !== 'morning' && dayPhase !== 'ended' && (
          <div
            className="fixed z-20 pointer-events-auto select-none"
            style={{
              top: 'max(5.8rem, calc(env(safe-area-inset-top) + 5.5rem))',
              right: 'max(0.5rem, env(safe-area-inset-right))',
            }}
          >
            {callEarthState === 'idle' ? (
              <button
                type="button"
                onClick={() => {
                  sfx('switch', { volume: 0.6 })
                  startCallEarth()
                }}
                disabled={battery < 5}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 border-2 border-sky-400 text-white shadow-lg flex flex-col items-center justify-center cursor-pointer active:scale-95"
                title="Call Earth (costs 5 battery)"
                aria-label="Call Earth"
              >
                <span className="text-sm">📡</span>
                <span className="text-[8px] font-mono font-bold leading-none">-5🔋</span>
              </button>
            ) : callEarthState === 'calling' ? (
              <div
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-sky-950/90 border-2 border-sky-400 text-sky-300 shadow-lg flex flex-col items-center justify-center animate-pulse"
                title="Transmission in flight..."
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mb-0.5" />
                <span className="font-mono text-[8px] font-bold">
                  {Math.ceil(callEarthCountdown)}s
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={dismissCallEarthReply}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-emerald-600 border-2 border-emerald-300 text-white shadow-lg flex items-center justify-center text-lg animate-bounce cursor-pointer"
                title="Reply received! Tap to read"
                aria-label="Read Earth Transmission"
              >
                📩
              </button>
            )}
          </div>
        )}

        {/* E) Mobile Explorer Mode Hint Arrow Badge */}
        {hasHints && nearestUndiscoveredSpot && dayPhase !== 'morning' && (
          <div
            className="fixed z-20 pointer-events-auto select-none"
            style={{
              top: 'max(5.8rem, calc(env(safe-area-inset-top) + 5.5rem))',
              left: 'max(0.5rem, env(safe-area-inset-left))',
            }}
          >
            <div className="bg-emerald-950/90 backdrop-blur-sm border border-emerald-500/60 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg text-[10px] text-emerald-300 font-mono">
              <span
                className="text-xs font-bold leading-none transition-transform duration-100"
                style={{ transform: `rotate(${nearestSpotAngleDeg}deg)` }}
              >
                ↑
              </span>
              <span className="truncate max-w-[120px]">
                {nearestUndiscoveredSpot.name} {Math.round(nearestSpotDist)}m
              </span>
            </div>
          </div>
        )}

        {/* F) Sunset Alert Banner for Mobile (Responsive Width) */}
        {isSunsetWarning && (
          <div
            className="fixed z-20 pointer-events-none select-none left-1/2 -translate-x-1/2 w-[90vw] max-w-xs text-center"
            style={{
              top: 'max(8.5rem, calc(env(safe-area-inset-top) + 8rem))',
            }}
          >
            <div className="animate-bounce bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-red-400/50 shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-sm">
              <span>⚠️</span>
              <span className="truncate">
                {planet === 'moon' ? 'Night soon! Head home.' : 'Sunset soon! Head home.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP HUD (screens ≥ 640px, hidden sm:block)              */}
      {/* ============================================================== */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none z-20">
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

          {/* C) Discoveries Score & Goal */}
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

          {/* D) Call Earth */}
          {dayPhase !== 'morning' && dayPhase !== 'ended' && (
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between w-52 border border-white/10 shadow-lg pointer-events-auto">
              {callEarthState === 'idle' ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => {
                      sfx('switch', { volume: 0.6 })
                      startCallEarth()
                    }}
                    disabled={battery < 5}
                    className="min-h-[44px] px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
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
                    className="min-h-[44px] px-2 text-xs text-slate-300 hover:text-white underline font-mono cursor-pointer"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* E) Explorer Mode Hint Arrow */}
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
        {/* Positioned top-16 right-4 to guarantee NO overlap with SoundToggle in top-right corner! */}
        <div className="absolute top-16 right-4 flex flex-col gap-2 pointer-events-auto">
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
      </div>

      {/* ============================================================== */}
      {/* 3. DESKTOP INTERACTIVE SCAN PROMPT (Center-Bottom)            */}
      {/* ============================================================== */}
      {nearbySpot && dayPhase !== 'morning' && dayPhase !== 'ended' && !isPoweredOff && (
        <div className="hidden sm:flex absolute bottom-24 left-1/2 -translate-x-1/2 flex-col items-center gap-2 pointer-events-auto animate-fade-in z-30">
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
                  className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-white font-extrabold text-sm rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2"
                >
                  <span>🔬</span>
                  <span>Scan {nearbySpot.type === 'rock' ? 'Rock' : nearbySpot.type === 'riverbed' ? 'Riverbed' : 'Ice'}</span>
                  <span className="bg-black/30 px-1.5 py-0.5 rounded text-[11px] font-mono">
                    -{nearbySpot.batteryCost} 🔋
                  </span>
                </button>

                <div className="flex flex-col text-left pr-2 text-xs text-slate-300">
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

      {/* Incoming Earth Transmission Modal (Stage 7A) */}
      {callEarthState === 'received' && callEarthMessage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm pointer-events-auto animate-fade-in select-none overflow-y-auto">
          <div className="bg-slate-900 border-2 border-sky-400 rounded-3xl max-w-md w-full p-5 sm:p-6 text-white shadow-2xl flex flex-col gap-3.5 my-auto max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-xl flex-shrink-0">
                  📡
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
                    NASA Mission Control
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-100">
                    Incoming Transmission
                  </h3>
                </div>
              </div>
              <WhyButton term="comms delay" />
            </div>

            <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-xs text-sky-200 leading-relaxed font-mono">
              {callEarthMessage}
            </div>

            <div className="text-[11px] text-slate-400 leading-snug">
              <span className="text-slate-300 font-semibold">NASA Comms Note: </span>
              Radio messages travel at light speed, but distance creates delay ({planet === 'mars' ? 'scaled from 4–24 min' : 'scaled from ~1.3s'}). By the time Earth responds, you may already be in the storm!
            </div>

            <button
              type="button"
              onClick={dismissCallEarthReply}
              className="w-full min-h-[44px] py-3 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-sky-950/50"
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
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-auto select-none p-4 text-center overflow-y-auto">
            <div className="max-w-sm w-full my-auto flex flex-col items-center">
              <p className="text-white text-2xl sm:text-3xl font-bold mb-2 tracking-wide">
                Rover out of power
              </p>
              <p className="text-gray-300 text-xs sm:text-sm max-w-sm mb-5">
                The battery reached 0%. Wait for sunset rescue, or tow back to base now.
              </p>
              <button
                onClick={() => {
                  setBattery(batteryCapacity)
                  setIsPoweredOff(false)
                  window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
                }}
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-lg"
              >
                Tow Rover to Base & Recharge
              </button>
            </div>
          </div>
        )}
    </>
  )
}
