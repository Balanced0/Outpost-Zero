import { useEffect, useState } from 'react'
import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'
import { BASE_SAFE_DISTANCE, SUNSET_WARN_SEC } from '../config/gameConfig'
import { DIFFICULTIES } from '../config/difficulty'
import WhyButton from './WhyButton'
import { sfx } from '../utils/sound'
import {
  BatteryBoltIcon,
  AirLifeSupportIcon,
  ShieldDefenseIcon,
  HeartPulseIcon,
  CrystalSampleIcon,
  RadarDishIcon,
  CompassNeedleIcon,
  ScannerReticleIcon,
  MarsGlobeIcon,
  MoonGlobeIcon,
  AlertTriangleIcon,
  ZapBoltIcon,
} from './icons/MissionIcons'

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
  const stormState = useGameStore((s) => s.stormState)

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

  // Detect touch device (e.g. iPad / tablet / mobile) to tailor prompts
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches)
    setIsTouchDevice(isTouch)
  }, [])

  if (!isGameStarted) {
    return null
  }

  // Battery bar percentage & color
  const batteryPercent =
    batteryCapacity > 0 ? (battery / batteryCapacity) * 100 : 0
  const batteryColor =
    batteryPercent > 50
      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
      : batteryPercent >= 20
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-500 to-red-400'

  // Air meter color change
  const airColor =
    air > 50
      ? 'bg-gradient-to-r from-cyan-500 to-sky-400'
      : air >= 20
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-500 to-red-400'
  const airTextColor =
    air > 50 ? 'text-cyan-300' : air >= 20 ? 'text-amber-300' : 'text-rose-400'

  // Crew health meter color change
  const healthColor =
    crewHealth > 50
      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
      : crewHealth >= 20
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-500 to-red-400'
  const healthTextColor =
    crewHealth > 50 ? 'text-emerald-300' : crewHealth >= 20 ? 'text-amber-300' : 'text-rose-400'

  // Distance to base
  const dx = BASE_X - roverX
  const dy = BASE_Y - roverY
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy))
  const isRecharging = distance <= BASE_SAFE_DISTANCE

  // Arrow angle to base
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
  const discoveryGoal = DIFFICULTIES[difficulty].discoveryGoal
  const goalProgressPct = Math.max(0, Math.min(100, (totalDiscoveryPoints / discoveryGoal) * 100))

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

  const hasActiveStormBanner = stormState === 'warning' || stormState === 'active'

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE & SMALL TABLET COMPACT HUD (screens < 768px, md:hidden) */}
      {/* ============================================================== */}
      <div className="md:hidden">
        {/* A) Single Thin Top Bar: Day, Time bar, Discoveries */}
        <div
          className="fixed top-0 left-0 right-0 z-20 hud-glass border-t-0 border-x-0 px-3 py-1.5 flex items-center justify-between text-xs pointer-events-auto select-none"
          style={{
            paddingTop: 'max(0.4rem, env(safe-area-inset-top))',
            paddingRight: 'max(6.2rem, calc(env(safe-area-inset-right) + 5.8rem))',
          }}
        >
          {/* Day & Sun bar */}
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <span className="font-mono font-bold text-orange-400 text-[11px] whitespace-nowrap">
              D{day}/20
            </span>
            <div className="flex-1 max-w-[120px] sm:max-w-[180px] h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isSunsetWarning
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300'
                }`}
                style={{ width: `${dayPhase === 'morning' ? 100 : timePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-300 font-mono font-semibold">
              {dayPhase === 'morning' ? 'Plan' : `${Math.ceil(timeLeft)}s`}
            </span>
          </div>

          {/* Discoveries Score & Goal */}
          <button
            type="button"
            onClick={() => openGlossaryCard('scan')}
            className="flex items-center gap-1 bg-purple-950/60 border border-purple-400/40 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-300 cursor-pointer flex-shrink-0"
            title="Discoveries (tap to learn more)"
          >
            <CrystalSampleIcon size={12} className="text-purple-300" />
            <span>{totalDiscoveryPoints} pts</span>
          </button>
        </div>

        {/* B) Floating Icon-Only Meters (Battery, Air, Shield, Crew) */}
        <div
          className="fixed z-20 flex items-center gap-1.5 pointer-events-auto select-none"
          style={{
            top: 'max(2.75rem, calc(env(safe-area-inset-top) + 2.4rem))',
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
            className="min-h-[42px] px-2.5 py-1 hud-glass rounded-xl border-emerald-500/40 flex items-center gap-1.5 text-[11px] font-mono font-bold text-white active:scale-95 cursor-pointer"
          >
            <BatteryBoltIcon size={14} className="text-emerald-400" />
            <span className={batteryPercent < 20 ? 'text-rose-400' : 'text-slate-100'}>
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
            className="min-h-[42px] px-2.5 py-1 hud-glass rounded-xl border-cyan-400/40 flex items-center gap-1.5 text-[11px] font-mono font-bold active:scale-95 cursor-pointer"
          >
            <AirLifeSupportIcon size={14} className="text-cyan-400" />
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
            className="min-h-[42px] px-2.5 py-1 hud-glass rounded-xl border-purple-500/40 flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-300 active:scale-95 cursor-pointer"
          >
            <ShieldDefenseIcon size={14} className="text-purple-400" />
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
            className={`min-h-[42px] px-2.5 py-1 hud-glass rounded-xl flex items-center gap-1.5 text-[11px] font-mono font-bold active:scale-95 cursor-pointer ${
              crewHealth > 50 ? 'border-rose-500/40' : 'border-rose-500/80'
            }`}
          >
            <HeartPulseIcon size={14} className="text-rose-400" />
            <span className={healthTextColor}>{Math.round(crewHealth)}%</span>
          </button>
        </div>

        {/* C) Base Arrow & Distance as a round compass badge */}
        <div
          className="fixed z-20 pointer-events-auto select-none"
          style={{
            top: 'max(2.75rem, calc(env(safe-area-inset-top) + 2.4rem))',
            right: 'max(0.5rem, env(safe-area-inset-right))',
          }}
        >
          <div
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hud-glass flex flex-col items-center justify-center text-white ${
              isRecharging
                ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] animate-pulse'
                : 'border-white/15'
            }`}
            title="Base Compass"
          >
            <span
              className="leading-none transition-transform duration-100 text-orange-400"
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              <CompassNeedleIcon size={13} />
            </span>
            <span className="font-mono text-[9px] font-bold leading-none mt-0.5 text-slate-200">
              {isRecharging ? '⚡' : `${distance}m`}
            </span>
          </div>
        </div>

        {/* D) "Call Earth" round transceiver button */}
        {dayPhase !== 'morning' && dayPhase !== 'ended' && (
          <div
            className="fixed z-20 pointer-events-auto select-none"
            style={{
              top: 'max(5.9rem, calc(env(safe-area-inset-top) + 5.6rem))',
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
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-sky-500 to-blue-700 hover:from-sky-400 hover:to-blue-600 active:scale-95 disabled:opacity-40 border border-sky-300/60 text-white shadow-[0_0_14px_rgba(56,189,248,0.4)] flex flex-col items-center justify-center cursor-pointer transition-all"
                title="Call Earth (costs 5 battery)"
                aria-label="Call Earth"
              >
                <RadarDishIcon size={14} />
                <span className="text-[8px] font-mono font-bold leading-none mt-0.5">-5⚡</span>
              </button>
            ) : callEarthState === 'calling' ? (
              <div
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hud-glass border-sky-400/70 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)] flex flex-col items-center justify-center animate-pulse"
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
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-b from-emerald-500 to-teal-600 border border-emerald-300 text-white shadow-[0_0_14px_rgba(16,185,129,0.5)] flex items-center justify-center text-base animate-bounce cursor-pointer"
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
              top: 'max(5.9rem, calc(env(safe-area-inset-top) + 5.6rem))',
              left: 'max(0.5rem, env(safe-area-inset-left))',
            }}
          >
            <div className="hud-glass border-teal-400/50 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-teal-300 font-mono">
              <span
                className="leading-none transition-transform duration-100 text-teal-300"
                style={{ transform: `rotate(${nearestSpotAngleDeg}deg)` }}
              >
                <CompassNeedleIcon size={11} />
              </span>
              <span className="truncate max-w-[125px]">
                {nearestUndiscoveredSpot.name} {Math.round(nearestSpotDist)}m
              </span>
            </div>
          </div>
        )}

        {/* F) Sunset Alert Banner for Mobile */}
        {isSunsetWarning && (
          <div
            className="fixed inset-x-0 z-20 pointer-events-none select-none flex justify-center px-4"
            style={{
              top: hasActiveStormBanner
                ? 'max(11.8rem, calc(env(safe-area-inset-top) + 11.4rem))'
                : 'max(8.2rem, calc(env(safe-area-inset-top) + 7.8rem))',
            }}
          >
            <div className="animate-bounce bg-rose-600/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-300/50 shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-md">
              <AlertTriangleIcon size={14} />
              <span className="truncate">
                {planet === 'moon' ? 'Night soon! Head home.' : 'Sunset soon! Head home.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. IPAD / TABLET & DESKTOP HUD (screens ≥ 768px, hidden md:block) */}
      {/*    - md (768px–1023px, iPad): compact 216px side stacks + 272px center */}
      {/*    - lg (1024px+, Desktop): full 264px side stacks + 320px center     */}
      {/* ============================================================== */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
        {/* Top-left: Battery, Base Compass, Discoveries, Call Earth, Nearest (Explorer only) */}
        <div className="absolute top-3.5 lg:top-4 left-3.5 lg:left-4 flex flex-col gap-2">
          {/* A) Rover Battery Gauge */}
          <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] pointer-events-auto flex items-center gap-2.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <BatteryBoltIcon size={17} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-[11px] lg:text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1 truncate">
                  <span className="font-display tracking-tight truncate">Rover Battery</span>
                  <WhyButton term="rover battery" />
                </span>
                <span
                  className={`font-mono text-[10px] lg:text-[11px] font-bold flex-shrink-0 ${
                    batteryPercent < 20 ? 'text-rose-400 animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {Math.round(battery)} / {Math.round(batteryCapacity)}
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${batteryColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, batteryPercent))}%` }}
                />
              </div>
            </div>
          </div>

          {/* B) Base Vector Compass Panel */}
          <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] pointer-events-auto flex items-center gap-2.5 lg:gap-3">
            <div
              className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-100 border ${
                isRecharging
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                  : 'bg-slate-900/90 border-white/15 text-orange-400'
              }`}
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              <CompassNeedleIcon size={14} />
            </div>
            {isRecharging ? (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] lg:text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider truncate">
                    Outpost Base
                  </span>
                  <span className="text-emerald-300 text-[11px] lg:text-xs font-bold font-mono flex items-center gap-1">
                    <ZapBoltIcon size={11} /> Recharging!
                  </span>
                </div>
                <span className="text-[9px] lg:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex-shrink-0">
                  SAFE
                </span>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="flex flex-col">
                  <span className="text-[9px] lg:text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                    Base Vector
                  </span>
                  <span className="text-white text-[11px] lg:text-xs font-mono font-bold">
                    {distance} m
                  </span>
                </div>
                <span className="text-[9px] lg:text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                  HDG {((Math.round(angleDeg) % 360) + 360) % 360}°
                </span>
              </div>
            )}
          </div>

          {/* C) Discoveries Score & Goal */}
          <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] pointer-events-auto flex items-center gap-2.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-purple-500/15 border border-purple-400/35 flex items-center justify-center text-purple-300 flex-shrink-0">
              <CrystalSampleIcon size={17} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] lg:text-xs font-semibold text-white">
                <span className="flex items-center gap-1">
                  <span className="font-display tracking-tight">Discoveries</span>
                  <WhyButton term="scan" />
                </span>
                <span className="font-mono text-[11px] lg:text-xs font-bold text-amber-300">
                  {totalDiscoveryPoints} pts
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${goalProgressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] lg:text-[10px] text-slate-400 font-mono">
                <span>
                  Goal: {totalDiscoveryPoints} / {discoveryGoal} pts
                </span>
                {totalDiscoveryPoints >= discoveryGoal && (
                  <span className="text-emerald-400 font-bold">✓ Met</span>
                )}
              </div>
            </div>
          </div>

          {/* D) Call Earth DSN Transceiver */}
          {dayPhase !== 'morning' && dayPhase !== 'ended' && (
            <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] pointer-events-auto flex items-center gap-2.5 lg:gap-3">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-300 flex-shrink-0">
                <RadarDishIcon size={17} />
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
                      className="flex-1 mr-1 min-h-[34px] lg:min-h-[36px] py-1 px-2 lg:px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:from-sky-700 active:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] lg:text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 active:scale-[0.98]"
                      title="Send a message to NASA Mission Control (costs 5 battery)"
                    >
                      <span>Call Earth</span>
                      <span className="font-mono text-[9px] lg:text-[10px] text-sky-200 bg-black/25 px-1 py-0.5 rounded">
                        -5⚡
                      </span>
                    </button>
                    <WhyButton term="comms delay" />
                  </>
                ) : callEarthState === 'calling' ? (
                  <>
                    <div className="flex items-center gap-1.5 text-[11px] lg:text-xs text-sky-300 font-mono font-bold">
                      <div className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                      <span>Signal: {Math.ceil(callEarthCountdown)}s</span>
                    </div>
                    <WhyButton term="comms delay" />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] lg:text-xs text-emerald-300 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Reply!
                    </span>
                    <button
                      type="button"
                      onClick={dismissCallEarthReply}
                      className="min-h-[32px] px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-xl shadow cursor-pointer transition-colors"
                    >
                      Read
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E) Explorer Mode Nearest Hint Panel (ONLY on Explorer difficulty) */}
          {difficulty === 'explorer' && nearestUndiscoveredSpot && dayPhase !== 'morning' && (
            <div className="hud-glass border-teal-400/40 rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] pointer-events-auto flex items-center gap-2.5 lg:gap-3">
              <div
                className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-teal-500/15 border border-teal-400/40 flex items-center justify-center text-teal-300 transition-transform duration-100 flex-shrink-0"
                style={{ transform: `rotate(${nearestSpotAngleDeg}deg)` }}
              >
                <CompassNeedleIcon size={14} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col leading-tight">
                <span className="text-[9px] lg:text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                  Explorer Radar
                </span>
                <span className="text-white text-[11px] lg:text-xs font-bold truncate mt-0.5">
                  {nearestUndiscoveredSpot.name}
                </span>
                <span className="text-teal-300/90 font-mono text-[9px] lg:text-[10px]">
                  {Math.round(nearestSpotDist)} m away
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top-center: Day Timer, Sun bar, & Phase Tabs */}
        <div className="fixed inset-x-0 top-3.5 lg:top-4 flex flex-col items-center gap-2 pointer-events-none">
          <div className="hud-glass rounded-2xl px-4 lg:px-5 py-2.5 flex flex-col items-center w-[272px] lg:w-80 gap-2 pointer-events-auto">
            {/* Header: Planet, Difficulty, Commander */}
            <div className="flex items-center justify-between w-full text-[11px] font-medium text-slate-300 border-b border-white/[0.08] pb-1.5">
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                {planet === 'mars' ? (
                  <MarsGlobeIcon size={14} className="text-orange-400" />
                ) : (
                  <MoonGlobeIcon size={14} className="text-cyan-300" />
                )}
                <span>{planet === 'mars' ? 'Mars' : 'Moon'}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">{DIFFICULTIES[difficulty].name}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[90px]">
                {commanderName}
              </span>
            </div>

            {/* Day Title and Time Left */}
            <div className="flex items-center justify-between w-full text-xs font-bold text-white">
              <span className="font-display text-orange-400 font-bold tracking-tight text-sm">
                Day {day} of {maxDays}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`font-mono text-xs font-bold ${
                    isSunsetWarning ? 'text-rose-400 animate-pulse' : 'text-slate-200'
                  }`}
                >
                  {dayPhase === 'morning' ? 'Planning' : `${Math.ceil(timeLeft)}s left`}
                </span>
                <WhyButton term="sunset" />
              </div>
            </div>

            {/* Daylight progress bar */}
            <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.08]">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isSunsetWarning
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400'
                }`}
                style={{ width: `${dayPhase === 'morning' ? 100 : timePercent}%` }}
              />
            </div>

            {/* Segmented Morning / Midday / Sunset Tabs */}
            <div className="flex items-center justify-between w-full gap-1 bg-slate-950/60 p-0.5 rounded-xl border border-white/[0.06]">
              {[
                { id: 'morning', label: 'Morning' },
                { id: 'midday', label: 'Midday' },
                { id: 'sunset', label: planet === 'moon' ? 'Night' : 'Sunset' },
              ].map((tab) => {
                const isActive = currentPhase === tab.id

                return (
                  <div
                    key={tab.id}
                    className={`flex-1 text-center py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm'
                        : 'text-slate-500 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sunset Alert Banner (shifts below StormOverlay if a storm is also active) */}
          {isSunsetWarning && (
            <div
              className={`animate-bounce bg-rose-600/95 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-rose-300/50 shadow-lg flex items-center gap-1.5 backdrop-blur-md pointer-events-auto ${
                hasActiveStormBanner ? 'mt-28' : ''
              }`}
            >
              <AlertTriangleIcon size={14} />
              <span>{planet === 'moon' ? 'Night soon! Head home.' : 'Sunset soon! Head home.'}</span>
            </div>
          )}
        </div>

        {/* Top-right: Base Survival Meters (Air, Shield, Crew health) */}
        {/* Positioned at top-[4.25rem] right-3.5 lg:right-4 so it NEVER overlaps SoundToggle in the top-right corner! */}
        <div className="absolute top-[4.25rem] lg:top-[4.5rem] right-3.5 lg:right-4 flex flex-col gap-2 pointer-events-auto">
          {/* 1. Air Machine */}
          <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] flex items-center gap-2.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300 flex-shrink-0">
              <AirLifeSupportIcon size={17} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-[11px] lg:text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1 truncate">
                  <span className="font-display tracking-tight truncate">Air Machine</span>
                  <WhyButton term="air machine" />
                </span>
                <span className={`font-mono text-[10px] lg:text-[11px] font-bold ${airTextColor}`}>
                  {Math.round(air)}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${airColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, air))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Shield Strength Meter */}
          <div className="hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] flex items-center gap-2.5 lg:gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-purple-500/15 border border-purple-400/35 flex items-center justify-center text-purple-300 flex-shrink-0">
              <ShieldDefenseIcon size={17} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-[11px] lg:text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="font-display tracking-tight">Shield</span>
                  <WhyButton term="shield" />
                </span>
                <span className="font-mono text-[10px] lg:text-[11px] font-bold text-purple-300">
                  {shieldToday}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.07]">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-purple-500 to-fuchsia-400"
                  style={{ width: `${Math.max(0, Math.min(100, shieldToday))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Crew Health Meter */}
          <div
            className={`hud-glass rounded-2xl p-2 lg:p-2.5 w-[216px] lg:w-[264px] flex items-center gap-2.5 lg:gap-3 ${
              crewHealth <= 30 ? 'border-rose-500/60' : ''
            }`}
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-rose-500/15 border border-rose-400/35 flex items-center justify-center text-rose-300 flex-shrink-0">
              <HeartPulseIcon size={17} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-white text-[11px] lg:text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1 truncate">
                  <span className="font-display tracking-tight truncate">Crew Health</span>
                  <WhyButton term="radiation" />
                </span>
                <span
                  className={`font-mono text-[10px] lg:text-[11px] font-bold ${healthTextColor}`}
                >
                  {Math.round(crewHealth)}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-white/[0.07]">
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
      {/* 3. TABLET & DESKTOP INTERACTIVE SCAN PROMPT (Center-Bottom)    */}
      {/* ============================================================== */}
      {nearbySpot && dayPhase !== 'morning' && dayPhase !== 'ended' && !isPoweredOff && (
        <div className="hidden md:flex fixed inset-x-0 bottom-20 justify-center pointer-events-none z-30">
          {activeScan ? (
            <div className="mission-panel border border-cyan-400/60 rounded-2xl px-6 py-4 flex flex-col items-center min-w-[280px] text-center shadow-[0_0_30px_rgba(34,211,238,0.25)] pointer-events-auto animate-fade-in">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold mb-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>
                  SPECTROMETER SCANNING · {(activeScan.duration - activeScan.elapsed).toFixed(1)}s
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-100"
                  style={{ width: `${scanProgressPercent}%` }}
                />
              </div>

              <span className="text-[11px] text-slate-300 mt-2 font-medium">
                Hold position — moving cancels surface analysis
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pointer-events-auto animate-fade-in">
              {scanError && (
                <div className="bg-rose-950/95 border border-rose-500 text-rose-200 text-xs font-bold px-3.5 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1.5">
                  <AlertTriangleIcon size={13} />
                  <span>{scanError}</span>
                </div>
              )}

              <div className="mission-panel border border-amber-400/50 rounded-2xl p-2.5 flex items-center gap-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.75)]">
                <button
                  type="button"
                  onClick={() => startScan()}
                  className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-white font-display font-bold text-sm rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.4)] cursor-pointer transition-all flex items-center gap-2"
                >
                  <ScannerReticleIcon size={17} />
                  <span>
                    Scan{' '}
                    {nearbySpot.type === 'rock'
                      ? 'Rock'
                      : nearbySpot.type === 'riverbed'
                      ? 'Riverbed'
                      : 'Ice'}
                  </span>
                  <span className="bg-black/30 px-2 py-0.5 rounded-md text-[11px] font-mono">
                    -{nearbySpot.batteryCost}⚡
                  </span>
                </button>

                <div className="flex flex-col text-left pr-2.5 text-xs text-slate-300">
                  <span className="text-amber-300 font-mono font-bold">
                    +{nearbySpot.points} {nearbySpot.points === 1 ? 'Point' : 'Points'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {isTouchDevice ? (
                      'Tap button to analyze sample'
                    ) : (
                      <>
                        Press{' '}
                        <kbd className="bg-slate-800 border border-white/15 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">
                          SPACE
                        </kbd>{' '}
                        or click
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Incoming Earth Transmission Modal */}
      {callEarthState === 'received' && callEarthMessage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-[#04060d]/80 backdrop-blur-md pointer-events-auto animate-fade-in select-none overflow-y-auto">
          <div className="mission-panel border border-sky-400/50 rounded-[28px] max-w-md w-full p-5 sm:p-6 text-white flex flex-col gap-4 my-auto max-h-[92dvh] overflow-y-auto animate-modal-in">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-300 flex-shrink-0">
                  <RadarDishIcon size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 block">
                    NASA Deep Space Network
                  </span>
                  <h3 className="font-display font-bold text-base text-white">
                    Incoming Earth Transmission
                  </h3>
                </div>
              </div>
              <WhyButton term="comms delay" />
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-sky-500/20 text-xs text-sky-100 leading-relaxed font-mono">
              {callEarthMessage}
            </div>

            <div className="text-[11px] text-slate-400 leading-snug bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
              <span className="text-slate-200 font-semibold">Signal Latency Note: </span>
              Radio waves travel at the speed of light, creating real planetary delay (
              {planet === 'mars' ? 'scaled from 4–24 min' : 'scaled from ~1.3s'}). By the time
              Earth replies, surface conditions may already have shifted!
            </div>

            <button
              type="button"
              onClick={dismissCallEarthReply}
              className="w-full min-h-[46px] py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:from-sky-600 active:to-blue-700 text-white font-display font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-[0_8px_20px_-4px_rgba(14,165,233,0.45)]"
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
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#04060d]/85 backdrop-blur-md pointer-events-auto select-none p-4 text-center overflow-y-auto animate-fade-in">
            <div className="mission-panel border border-rose-500/45 rounded-[28px] max-w-sm w-full p-6 sm:p-7 my-auto flex flex-col items-center gap-4 animate-modal-in">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-400">
                <BatteryBoltIcon size={28} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block mb-1">
                  Emergency Power Depletion
                </span>
                <p className="font-display text-white text-2xl font-bold tracking-tight">
                  Rover out of power
                </p>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
                  The rover battery reached 0%. Wait for automatic sunset recovery, or request an immediate base tow now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBattery(batteryCapacity)
                  setIsPoweredOff(false)
                  window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
                }}
                className="w-full min-h-[48px] px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-sm"
              >
                Tow Rover to Base &amp; Recharge
              </button>
            </div>
          </div>
        )}
    </>
  )
}
