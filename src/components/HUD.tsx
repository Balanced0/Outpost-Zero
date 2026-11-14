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

  // Base survival meters
  const air = useGameStore((s) => s.air)
  const shieldToday = useGameStore((s) => s.shieldToday)
  const crewHealth = useGameStore((s) => s.crewHealth)

  // Discoveries & Scan state
  const totalDiscoveryPoints = useGameStore((s) => s.totalDiscoveryPoints)
  const discoverySpots = useGameStore((s) => s.discoverySpots)
  const nearbySpot = useGameStore((s) => s.nearbySpot)
  const activeScan = useGameStore((s) => s.activeScan)
  const scanError = useGameStore((s) => s.scanError)
  const startScan = useGameStore((s) => s.startScan)

  // Call Earth Comms
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
      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
      : batteryPercent >= 20
      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
      : 'bg-gradient-to-r from-red-500 to-rose-400'

  // Air meter color change
  const airColor =
    air > 50
      ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
      : air >= 20
      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
      : 'bg-gradient-to-r from-red-500 to-rose-400'
  const airTextColor =
    air > 50 ? 'text-cyan-400' : air >= 20 ? 'text-yellow-400' : 'text-red-400'

  // Crew health meter color change
  const healthColor =
    crewHealth > 50
      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
      : crewHealth >= 20
      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
      : 'bg-gradient-to-r from-red-500 to-rose-400'
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

  // Active day phase for top-center tabs
  const currentPhase: 'morning' | 'midday' | 'sunset' =
    dayPhase === 'morning'
      ? 'morning'
      : isSunsetWarning || dayPhase === 'ended'
      ? 'sunset'
      : 'midday'

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE COMPACT HUD (screens < 640px, sm:hidden)            */}
      {/* ============================================================== */}
      <div className="sm:hidden">
        {/* A) Single Thin Top Bar: Day, Time bar, Discoveries */}
        <div
          className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 backdrop-blur-md border-b border-white/10 px-2.5 py-1.5 flex items-center justify-between text-xs pointer-events-auto select-none shadow-md"
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
            <div className="flex-1 max-w-[90px] h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10 shadow-inner">
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
            className="flex items-center gap-1 bg-gradient-to-r from-purple-950/70 to-slate-900/90 border border-purple-400/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] rounded-full px-2 py-0.5 text-[11px] font-bold text-amber-300 cursor-pointer flex-shrink-0"
            title="Discoveries (tap to learn more)"
          >
            <span>💎</span>
            <span>{totalDiscoveryPoints} pts</span>
          </button>
        </div>

        {/* B) Floating Icon-Only Meters (Battery, Air, Shield, Crew) */}
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
            className="min-h-[44px] px-2 py-1 bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-md rounded-2xl border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.22)] flex items-center gap-1 text-[11px] font-mono font-bold text-white active:scale-95 cursor-pointer"
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
            className="min-h-[44px] px-2 py-1 bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-md rounded-2xl border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.22)] flex items-center gap-1 text-[11px] font-mono font-bold active:scale-95 cursor-pointer"
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
            className="min-h-[44px] px-2 py-1 bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-md rounded-2xl border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.22)] flex items-center gap-1 text-[11px] font-mono font-bold text-purple-300 active:scale-95 cursor-pointer"
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
            className={`min-h-[44px] px-2 py-1 bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-md rounded-2xl border shadow-md flex items-center gap-1 text-[11px] font-mono font-bold active:scale-95 cursor-pointer ${
              crewHealth > 50
                ? 'border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.22)]'
                : 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
            }`}
          >
            <span>❤️</span>
            <span className={healthTextColor}>{Math.round(crewHealth)}%</span>
          </button>
        </div>

        {/* C) Base Arrow & Distance as a glossy round badge */}
        <div
          className="fixed z-20 pointer-events-auto select-none"
          style={{
            top: 'max(2.6rem, calc(env(safe-area-inset-top) + 2.3rem))',
            right: 'max(0.5rem, env(safe-area-inset-right))',
          }}
        >
          <div
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md border shadow-lg flex flex-col items-center justify-center text-white ${
              isRecharging
                ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] animate-pulse'
                : 'border-slate-600/70'
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

        {/* D) "Call Earth" as a glossy round button */}
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
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-95 disabled:opacity-40 border-2 border-blue-400 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] flex flex-col items-center justify-center cursor-pointer transition-all"
                title="Call Earth (costs 5 battery)"
                aria-label="Call Earth"
              >
                <span className="text-sm">📡</span>
                <span className="text-[8px] font-mono font-bold leading-none">-5🔋</span>
              </button>
            ) : callEarthState === 'calling' ? (
              <div
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/95 border-2 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)] flex flex-col items-center justify-center animate-pulse"
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
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-emerald-500 to-green-600 border-2 border-emerald-300 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center justify-center text-lg animate-bounce cursor-pointer"
                title="Reply received! Tap to read"
                aria-label="Read Earth Transmission"
              >
                📩
              </button>
            )}
          </div>
        )}

        {/* E) Mobile Explorer Mode Hint Arrow Badge (Explorer only) */}
        {difficulty === 'explorer' && nearestUndiscoveredSpot && dayPhase !== 'morning' && (
          <div
            className="fixed z-20 pointer-events-auto select-none"
            style={{
              top: 'max(5.8rem, calc(env(safe-area-inset-top) + 5.5rem))',
              left: 'max(0.5rem, env(safe-area-inset-left))',
            }}
          >
            <div className="bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-md border border-teal-400/60 shadow-[0_0_10px_rgba(20,184,166,0.3)] rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-teal-300 font-mono">
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

        {/* F) Sunset Alert Banner for Mobile */}
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
        {/* Top-left: Battery, Base, Discoveries, Call Earth, Nearest (Explorer only) */}
        <div className="absolute top-4 left-4 flex flex-col gap-2.5">
          {/* A) Rover Battery Gauge */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.22)] pointer-events-auto flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/40 border border-emerald-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(16,185,129,0.3)] flex-shrink-0">
              🔋
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Rover Battery</span>
                  <WhyButton term="rover battery" />
                </span>
                <span className="font-mono text-[11px] text-slate-300 font-bold">
                  {Math.round(battery)} / {Math.round(batteryCapacity)}
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${batteryColor} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}
                  style={{ width: `${Math.max(0, Math.min(100, batteryPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* B) Base Direction Panel */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-slate-700/70 shadow-[0_0_12px_rgba(148,163,184,0.12)] pointer-events-auto flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-base leading-none transition-transform duration-100 shadow-sm border ${
                isRecharging
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)] animate-pulse'
                  : 'bg-slate-800/90 border-slate-600/60'
              }`}
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              ↑
            </div>
            {isRecharging ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">BASE</span>
                <span className="text-emerald-300 text-xs font-bold font-mono animate-pulse">⚡ Recharging!</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">BASE</span>
                <span className="text-white text-xs font-mono font-bold">{distance} m</span>
              </div>
            )}
          </div>

          {/* C) Discoveries Score & Goal */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.22)] pointer-events-auto flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/25 to-purple-700/40 border border-purple-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(168,85,247,0.3)] flex-shrink-0">
              💎
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1">
                  <span>Discoveries</span>
                  <WhyButton term="scan" />
                </span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {totalDiscoveryPoints} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Goal: {totalDiscoveryPoints} / {DIFFICULTIES[difficulty].discoveryGoal} points</span>
                {totalDiscoveryPoints >= DIFFICULTIES[difficulty].discoveryGoal && (
                  <span className="text-emerald-400 font-bold">✓</span>
                )}
              </div>
            </div>
          </div>

          {/* D) Call Earth */}
          {dayPhase !== 'morning' && dayPhase !== 'ended' && (
            <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-blue-500/70 shadow-[0_0_15px_rgba(59,130,246,0.25)] pointer-events-auto flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-700/40 border border-blue-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(59,130,246,0.3)] flex-shrink-0">
                📡
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                {callEarthState === 'idle' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        sfx('switch', { volume: 0.6 })
                        startCallEarth()
                      }}
                      disabled={battery < 5}
                      className="flex-1 mr-1 min-h-[38px] py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      title="Send a message to NASA Mission Control (costs 5 battery)"
                    >
                      <span>Call Earth (-5 🔋)</span>
                    </button>
                    <WhyButton term="comms delay" />
                  </>
                ) : callEarthState === 'calling' ? (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-sky-300 animate-pulse font-mono font-bold">
                      <div className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      <span>Waiting... {Math.ceil(callEarthCountdown)}s</span>
                    </div>
                    <WhyButton term="comms delay" />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <span>📩</span> Reply received!
                    </span>
                    <button
                      type="button"
                      onClick={dismissCallEarthReply}
                      className="min-h-[36px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-colors"
                    >
                      View
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E) Explorer Mode Nearest Hint Panel (ONLY on Explorer difficulty) */}
          {difficulty === 'explorer' && nearestUndiscoveredSpot && dayPhase !== 'morning' && (
            <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-teal-500/70 shadow-[0_0_15px_rgba(20,184,166,0.25)] pointer-events-auto flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/25 to-emerald-700/40 border border-teal-400/50 flex items-center justify-center text-teal-300 text-base leading-none transition-transform duration-100 shadow-[0_0_8px_rgba(20,184,166,0.3)] flex-shrink-0"
                style={{ transform: `rotate(${nearestSpotAngleDeg}deg)` }}
              >
                ↑
              </div>
              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="text-teal-200 text-xs font-bold truncate">
                  Nearest: {nearestUndiscoveredSpot.name}
                </span>
                <span className="text-teal-400/80 font-mono text-[10px]">
                  {Math.round(nearestSpotDist)} m away
                </span>
              </div>
              <span className="text-teal-400 text-base font-bold pr-1 select-none">
                ›
              </span>
            </div>
          )}
        </div>

        {/* Top-center: Day Timer, Sun bar, & Phase Tabs */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-auto">
          <div className="bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 backdrop-blur-md border border-slate-700/80 shadow-[0_0_20px_rgba(0,0,0,0.6)] rounded-2xl px-5 py-2.5 flex flex-col items-center w-72 sm:w-80 gap-2">
            {/* Header: Planet dot and real difficulty name once */}
            <div className="flex items-center justify-center w-full text-xs font-semibold text-slate-300 gap-1.5 border-b border-white/10 pb-1.5">
              <span>{planet === 'mars' ? '🔴 Mars' : '⚪ Moon'}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-200">{DIFFICULTIES[difficulty].name}</span>
            </div>

            {/* Day Title and Time Left */}
            <div className="flex items-center justify-between w-full text-xs font-bold text-white">
              <span className="text-orange-400 font-extrabold tracking-wide text-sm">
                Day {day} of {maxDays}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-200 text-xs font-bold">
                  {dayPhase === 'morning' ? 'Planning' : `${Math.ceil(timeLeft)}s left`}
                </span>
                <WhyButton term="sunset" />
              </div>
            </div>

            {/* Thicker rounded progress bar with subtle glow */}
            <div className="relative w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isSunsetWarning
                    ? 'bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                }`}
                style={{ width: `${dayPhase === 'morning' ? 100 : timePercent}%` }}
              />
            </div>

            {/* Pill-shaped Morning / Midday / Sunset Tabs */}
            <div className="flex items-center justify-between w-full gap-1 pt-0.5">
              {[
                { id: 'morning', label: '🌅 Morning' },
                { id: 'midday', label: '☀️ Midday' },
                { id: 'sunset', label: planet === 'moon' ? '🌑 Night' : '🌇 Sunset' },
              ].map((tab) => {
                const isActive = currentPhase === tab.id

                return (
                  <div
                    key={tab.id}
                    className={`flex-1 text-center py-1 px-1 rounded-full text-[10px] font-bold transition-all ${
                      isActive
                        ? 'border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        : 'border border-slate-800 bg-slate-900/40 text-slate-500'
                    }`}
                  >
                    {tab.label}
                  </div>
                )
              })}
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
        {/* Positioned at top-[4.5rem] right-4 so it NEVER overlaps SoundToggle in the top-right corner! */}
        <div className="absolute top-[4.5rem] right-4 flex flex-col gap-2.5 pointer-events-auto">
          {/* 1. Air Machine */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-cyan-400/70 shadow-[0_0_15px_rgba(34,211,238,0.22)] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/25 to-cyan-700/40 border border-cyan-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(34,211,238,0.3)] flex-shrink-0">
              🫁
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Air Machine</span>
                  <WhyButton term="air machine" />
                </span>
                <span className={`font-mono text-[11px] font-bold ${airTextColor}`}>
                  {Math.round(air)}%
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${airColor} shadow-[0_0_8px_rgba(34,211,238,0.5)]`}
                  style={{ width: `${Math.max(0, Math.min(100, air))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Shield Strength Meter */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.22)] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/25 to-purple-700/40 border border-purple-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(168,85,247,0.3)] flex-shrink-0">
              🛡️
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Shield</span>
                  <WhyButton term="shield" />
                </span>
                <span className="font-mono text-[11px] font-bold text-purple-300">
                  {shieldToday}%
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{ width: `${Math.max(0, Math.min(100, shieldToday))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Crew Health Meter */}
          <div className={`bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 backdrop-blur-md rounded-2xl p-2.5 w-64 border flex items-center gap-2.5 ${
            crewHealth > 50
              ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.22)]'
              : 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/25 to-rose-700/40 border border-rose-400/50 flex items-center justify-center text-lg shadow-[0_0_8px_rgba(244,63,94,0.3)] flex-shrink-0">
              ❤️
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Crew Health</span>
                  <WhyButton term="radiation" />
                </span>
                <span className={`font-mono text-[11px] font-bold ${healthTextColor}`}>
                  {Math.round(crewHealth)}%
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${healthColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, crewHealth))}%` }}
                />
              </div>
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

              <div className="bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-md border border-amber-400/80 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3">
                <button
                  type="button"
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

      {/* Incoming Earth Transmission Modal */}
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
                type="button"
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
