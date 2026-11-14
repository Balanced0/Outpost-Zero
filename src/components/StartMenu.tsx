import { useState, useEffect } from 'react'
import { useGameStore, loadSavedSettings } from '../store/gameStore'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'
import { sfx } from '../utils/sound'
import {
  PlanetarySpaceCanvas,
  MiniPlanetVideoCanvas,
} from './PlanetarySpaceCanvas'
import {
  RocketIcon,
  AstronautIcon,
  DatabaseScienceIcon,
  ZapBoltIcon,
  CrystalSampleIcon,
  RadarDishIcon,
} from './icons/MissionIcons'

export default function StartMenu() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const launchMission = useGameStore((s) => s.launchMission)
  const setShowDataSourcesModal = useGameStore((s) => s.setShowDataSourcesModal)

  const saved = loadSavedSettings()
  const [commanderName, setCommanderName] = useState(saved.commanderName || 'Commander')
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>(saved.planet || 'mars')
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(
    saved.difficulty || 'commander'
  )
  const [skipTutorial, setSkipTutorial] = useState<boolean>(saved.skipTutorial ?? false)

  // Interactive cursor state for 3D card tilt & glossy spotlight reflection
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, spotX: 50, spotY: 25 })

  // Live ticking telemetry clock for aerospace realism
  const [telemetryTick, setTelemetryTick] = useState(0)
  useEffect(() => {
    if (isGameStarted) return
    const interval = setInterval(() => {
      setTelemetryTick((t) => (t + 1) % 1000)
    }, 120)
    return () => clearInterval(interval)
  }, [isGameStarted])

  if (isGameStarted) {
    return null
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window
    const nx = (e.clientX / Math.max(1, innerWidth) - 0.5) * 2 // -1..1
    const ny = (e.clientY / Math.max(1, innerHeight) - 0.5) * 2 // -1..1
    setMousePos({
      x: nx,
      y: ny,
      spotX: Math.round((e.clientX / Math.max(1, innerWidth)) * 100),
      spotY: Math.round((e.clientY / Math.max(1, innerHeight)) * 100),
    })
  }

  const handleLaunch = () => {
    sfx('launch', { volume: 0.7 })
    launchMission({
      commanderName: commanderName.trim() || 'Commander',
      planet: selectedPlanet,
      difficulty: selectedDifficulty,
      skipTutorial,
    })
  }

  const activeThemePlanet = hoveredPlanet || selectedPlanet
  const isMars = activeThemePlanet === 'mars'

  return (
    <div
      onMouseMove={handleMouseMove}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 pointer-events-auto select-none overflow-y-auto tech-grid-bg transition-colors duration-500"
      style={{
        background: isMars
          ? `radial-gradient(circle at ${mousePos.spotX}% ${mousePos.spotY}%, rgba(249, 115, 22, 0.22) 0%, transparent 42%), radial-gradient(ellipse at 75% 20%, rgba(194, 65, 12, 0.35) 0%, rgba(15, 23, 42, 0.92) 55%, #03050a 100%)`
          : `radial-gradient(circle at ${mousePos.spotX}% ${mousePos.spotY}%, rgba(34, 211, 238, 0.22) 0%, transparent 42%), radial-gradient(ellipse at 25% 75%, rgba(14, 116, 144, 0.35) 0%, rgba(15, 23, 42, 0.92) 55%, #03050a 100%)`,
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      {/* ============================================================== */}
      {/* 1. 60FPS VIDEO-LIKE INTERACTIVE MARS & MOON COSMOS CANVAS       */}
      {/* ============================================================== */}
      <PlanetarySpaceCanvas
        selectedPlanet={selectedPlanet}
        hoveredPlanet={hoveredPlanet}
      />

      {/* ============================================================== */}
      {/* 2. ULTRA-GLOSSY INTERACTIVE COMMAND DECK                       */}
      {/* ============================================================== */}
      <div
        className="mission-panel rounded-[30px] max-w-[610px] w-full p-4 sm:p-6 text-white flex flex-col gap-3.5 my-auto relative z-10 max-h-[94dvh] overflow-y-auto animate-modal-in transition-shadow duration-500"
        style={{
          transform: `perspective(1400px) rotateX(${(mousePos.y * -1.4).toFixed(2)}deg) rotateY(${(
            mousePos.x * 1.4
          ).toFixed(2)}deg)`,
          boxShadow: isMars
            ? '0 32px 90px -12px rgba(0, 0, 0, 0.92), 0 0 65px -10px rgba(249, 115, 22, 0.34), 0 1.5px 0 0 rgba(255, 255, 255, 0.38) inset'
            : '0 32px 90px -12px rgba(0, 0, 0, 0.92), 0 0 65px -10px rgba(34, 211, 238, 0.34), 0 1.5px 0 0 rgba(255, 255, 255, 0.38) inset',
        }}
      >
        {/* Dynamic Cursor-Following Specular Glass Reflection */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[30px] transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at ${mousePos.spotX}% ${mousePos.spotY}%, ${
              isMars ? 'rgba(251, 146, 60, 0.13)' : 'rgba(34, 211, 238, 0.13)'
            }, transparent 65%)`,
          }}
          aria-hidden="true"
        />

        {/* Specular Top Glass Edge Highlight */}
        <div
          className={`absolute top-0 left-6 right-6 h-[2.5px] rounded-full transition-colors duration-500 ${
            isMars
              ? 'bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_18px_rgba(249,115,22,0.95)]'
              : 'bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.95)]'
          }`}
        />

        {/* Top Live Telemetry & Solar Wind Monitor Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/75 border border-white/[0.14] text-[10px] font-mono text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isMars ? 'bg-orange-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isMars ? 'bg-orange-500' : 'bg-cyan-400'
                }`}
              />
            </span>
            <span className="font-bold tracking-wider uppercase text-white truncate">
              DSN TELEMETRY // {isMars ? 'MARS ORBITAL SECTOR 04' : 'LUNAR SOUTH POLE 09'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="hidden sm:inline text-amber-300/90 font-semibold">
              SOL-CLK {(1400 + (telemetryTick % 600)).toString().padStart(4, '0')}
            </span>
            <div className="flex items-end gap-[2px] h-3" aria-hidden="true">
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-orange-400' : 'bg-cyan-400'
                }`}
                style={{ animationDelay: '0s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-amber-300' : 'bg-sky-300'
                }`}
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-orange-500' : 'bg-cyan-500'
                }`}
                style={{ animationDelay: '0.4s' }}
              />
              <span
                className={`w-[2.5px] h-full rounded-full origin-bottom animate-wave-bar ${
                  isMars ? 'bg-amber-400' : 'bg-sky-400'
                }`}
                style={{ animationDelay: '0.1s' }}
              />
            </div>
          </div>
        </div>

        {/* Header: Mission Title, Glossy Badge & Interactive Trajectory Strip */}
        <div className="text-center flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-white/[0.08] via-white/[0.15] to-white/[0.08] border border-white/25 text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-amber-200 uppercase mb-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] relative overflow-hidden">
            <span className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>NASA Space Apps Challenge · Mission Trainer</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            OUTPOST{' '}
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500 ${
                isMars
                  ? 'from-orange-300 via-amber-400 to-rose-500 drop-shadow-[0_0_24px_rgba(249,115,22,0.65)]'
                  : 'from-cyan-200 via-sky-400 to-blue-500 drop-shadow-[0_0_24px_rgba(34,211,238,0.65)]'
              }`}
            >
              ZERO
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200/95 mt-1.5 font-medium tracking-wide max-w-md">
            Survive the Sun. Power the habitat. Explore the unknown across a 20-sol expedition.
          </p>
        </div>

        {/* Commander Callsign Input & Live Trajectory Readout */}
        <div className="glossy-card rounded-2xl p-3 border border-white/[0.16] flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <label
              htmlFor="commander-name-input"
              className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"
            >
              <AstronautIcon size={15} className={isMars ? 'text-orange-400' : 'text-cyan-400'} />
              <span>Welcome, Mission Commander</span>
            </label>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/35">
              ID // {(commanderName.trim() || 'COMMANDER').toUpperCase().slice(0, 12)}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              id="commander-name-input"
              type="text"
              maxLength={16}
              value={commanderName}
              onChange={(e) => setCommanderName(e.target.value)}
              placeholder="Commander"
              className="w-full min-h-[42px] bg-slate-950/90 border border-white/15 rounded-xl pl-3.5 pr-14 py-1.5 text-white font-semibold text-sm tracking-wide shadow-[inset_0_2px_6px_rgba(0,0,0,0.65)] focus:outline-none focus:border-orange-400/90 focus:ring-2 focus:ring-orange-500/25 transition-all"
            />
            <span className="absolute right-3.5 text-[11px] font-mono text-slate-400 pointer-events-none">
              {commanderName.length}/16
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 01 · LIVE 60FPS ANIMATED MARS & MOON SELECTION CARDS           */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              01 · Select Target World
            </span>
            <span className="text-[10px] font-mono text-sky-300">
              Move cursor to interact with orbits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* MARS LIVE VIDEO-CANVAS CARD */}
            <button
              type="button"
              onMouseEnter={() => setHoveredPlanet('mars')}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('mars')
              }}
              className={`group glossy-card p-3.5 rounded-2xl border text-left cursor-pointer flex flex-col gap-2 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'mars'
                  ? 'bg-gradient-to-br from-orange-950/85 via-slate-900/90 to-rose-950/75 border-orange-400 shadow-[0_0_36px_-4px_rgba(249,115,22,0.55),inset_0_1.5px_0_rgba(255,255,255,0.4)]'
                  : 'bg-slate-900/65 border-white/[0.14] hover:border-orange-400/65 opacity-90 hover:opacity-100'
              }`}
            >
              <div
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-orange-300/15 to-transparent animate-shimmer pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MiniPlanetVideoCanvas
                    planet="mars"
                    active={selectedPlanet === 'mars'}
                    hovered={hoveredPlanet === 'mars'}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                        Mars
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/25 border border-orange-400/50 text-orange-200 font-bold">
                        0.38G
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-orange-300 font-semibold block truncate">
                      {PLANETS.mars.tagline}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      PHOBOS / DEIMOS ORBIT
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                    selectedPlanet === 'mars'
                      ? 'bg-gradient-to-b from-orange-400 to-orange-600 border-orange-200 text-white font-bold shadow-[0_0_14px_rgba(249,115,22,0.9)] scale-105'
                      : 'border-white/25 bg-white/5 text-transparent group-hover:border-orange-400/60'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-snug relative z-10">
                Red regolith canyons, atmospheric dust haze, and a 20s DSN comms delay.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/75 border border-white/[0.12] text-slate-200">
                  <RadarDishIcon size={11} className="text-orange-400" /> 20s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/75 border border-white/[0.12] text-emerald-300">
                  <ZapBoltIcon size={11} className="text-emerald-400" /> Standard Drain
                </span>
              </div>
            </button>

            {/* MOON LIVE VIDEO-CANVAS CARD */}
            <button
              type="button"
              onMouseEnter={() => setHoveredPlanet('moon')}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('moon')
              }}
              className={`group glossy-card p-3.5 rounded-2xl border text-left cursor-pointer flex flex-col gap-2 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'moon'
                  ? 'bg-gradient-to-br from-cyan-950/85 via-slate-900/90 to-blue-950/75 border-cyan-400 shadow-[0_0_36px_-4px_rgba(34,211,238,0.55),inset_0_1.5px_0_rgba(255,255,255,0.4)]'
                  : 'bg-slate-900/65 border-white/[0.14] hover:border-cyan-400/65 opacity-90 hover:opacity-100'
              }`}
            >
              <div
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent animate-shimmer pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MiniPlanetVideoCanvas
                    planet="moon"
                    active={selectedPlanet === 'moon'}
                    hovered={hoveredPlanet === 'moon'}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                        Moon
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 font-bold">
                        0.16G
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold block truncate">
                      {PLANETS.moon.tagline}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      ARTEMIS GATEWAY ORBIT
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                    selectedPlanet === 'moon'
                      ? 'bg-gradient-to-b from-cyan-300 to-cyan-500 border-cyan-100 text-slate-950 font-bold shadow-[0_0_14px_rgba(34,211,238,0.9)] scale-105'
                      : 'border-white/25 bg-white/5 text-transparent group-hover:border-cyan-400/60'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-snug relative z-10">
                Grey lunar craters, swift 2s Earth link, +10% vacuum battery drain.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap relative z-10">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/75 border border-white/[0.12] text-cyan-200">
                  <RadarDishIcon size={11} className="text-cyan-400" /> 2s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950/75 border border-white/[0.12] text-amber-300">
                  <ZapBoltIcon size={11} className="text-amber-400" /> +10% Drain
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 02 · GLOSSY INTERACTIVE DIFFICULTY CARDS                       */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              02 · Mission Profile & Difficulty
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Real NASA DONKI Weather
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['explorer', 'commander', 'mission_control'] as DifficultyId[]).map((diffKey) => {
              const diff = DIFFICULTIES[diffKey]
              const isSelected = selectedDifficulty === diffKey

              const accentStyles = {
                explorer: isSelected
                  ? 'bg-gradient-to-b from-emerald-950/75 to-slate-900/90 border-emerald-400 shadow-[0_0_26px_-4px_rgba(16,185,129,0.45)]'
                  : 'bg-slate-900/65 border-white/[0.12] hover:border-emerald-400/50 opacity-85 hover:opacity-100',
                commander: isSelected
                  ? 'bg-gradient-to-b from-amber-950/75 to-slate-900/90 border-amber-400 shadow-[0_0_26px_-4px_rgba(245,158,11,0.45)]'
                  : 'bg-slate-900/65 border-white/[0.12] hover:border-amber-400/50 opacity-85 hover:opacity-100',
                mission_control: isSelected
                  ? 'bg-gradient-to-b from-purple-950/75 to-slate-900/90 border-purple-400 shadow-[0_0_26px_-4px_rgba(168,85,247,0.45)]'
                  : 'bg-slate-900/65 border-white/[0.12] hover:border-purple-400/50 opacity-85 hover:opacity-100',
              }[diffKey]

              const dotColor = {
                explorer: 'bg-emerald-400',
                commander: 'bg-amber-400',
                mission_control: 'bg-purple-400',
              }[diffKey]

              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => {
                    sfx('click_soft', { volume: 0.55 })
                    setSelectedDifficulty(diffKey)
                  }}
                  className={`glossy-card p-3 rounded-2xl border text-left cursor-pointer flex flex-col justify-between gap-2 min-h-[44px] relative overflow-hidden ${accentStyles}`}
                >
                  {isSelected && (
                    <div
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-bold text-xs sm:text-[13px] text-white flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${dotColor} ${
                            isSelected ? 'animate-ping' : ''
                          }`}
                        />
                        {diff.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {diff.ageGroup}
                    </span>
                    <p className="text-[11px] text-slate-200 leading-snug mt-1.5">
                      {diff.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.1] text-[10px] font-mono text-slate-200 relative z-10">
                    <span className="inline-flex items-center gap-0.5">
                      <ZapBoltIcon size={10} className="text-amber-400" />
                      {diff.powerBudget}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <CrystalSampleIcon size={10} className="text-purple-300" />
                      {diff.discoveryGoal} pts
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Skip Tutorial Switch Row */}
        <label className="glossy-card flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border border-white/[0.12] hover:border-white/25 text-xs text-slate-200 cursor-pointer select-none min-h-[44px] relative z-10">
          <div className="flex flex-col">
            <span className="font-semibold text-white text-xs">
              Skip onboarding flight tutorial
            </span>
            <span className="text-[11px] text-slate-400">
              Recommended if you have already completed Days 1–3 training
            </span>
          </div>
          <div className="relative inline-flex items-center flex-shrink-0">
            <input
              type="checkbox"
              checked={skipTutorial}
              onChange={(e) => {
                sfx('tick', { volume: 0.4 })
                setSkipTutorial(e.target.checked)
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-800 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:border-orange-300" />
          </div>
        </label>

        {/* Sticky Glossy Launch Mission Button & Data Sources */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-3 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-white/[0.14] flex flex-col gap-2 mt-auto relative z-10">
          <button
            onClick={handleLaunch}
            className={`group relative overflow-hidden w-full min-h-[52px] py-3.5 px-6 text-white font-display font-bold text-base md:text-lg tracking-wide rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99] border ${
              isMars
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 border-orange-300/70 shadow-[0_12px_36px_-6px_rgba(249,115,22,0.7),inset_0_1.5px_0_rgba(255,255,255,0.45)]'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 border-cyan-300/70 shadow-[0_12px_36px_-6px_rgba(34,211,238,0.65),inset_0_1.5px_0_rgba(255,255,255,0.45)]'
            }`}
          >
            <div
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer pointer-events-none"
              aria-hidden="true"
            />
            <RocketIcon
              size={21}
              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110 relative z-10"
            />
            <span className="relative z-10">
              Launch {selectedPlanet === 'mars' ? 'Mars' : 'Lunar'} Mission
            </span>
          </button>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                sfx('open_soft', { volume: 0.5 })
                setShowDataSourcesModal(true)
              }}
              className="min-h-[38px] px-3.5 py-1 rounded-full text-xs text-sky-300 hover:text-white hover:bg-white/[0.08] font-medium cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <DatabaseScienceIcon size={14} className="text-sky-400 animate-pulse" />
              <span>Data Sources & NASA Provenance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
