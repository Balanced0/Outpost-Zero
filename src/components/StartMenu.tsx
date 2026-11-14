import { useState } from 'react'
import { useGameStore, loadSavedSettings } from '../store/gameStore'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'
import { sfx } from '../utils/sound'
import {
  RocketIcon,
  AstronautIcon,
  MarsGlobeIcon,
  MoonGlobeIcon,
  DatabaseScienceIcon,
  ZapBoltIcon,
  CrystalSampleIcon,
  RadarDishIcon,
} from './icons/MissionIcons'

// Lightweight fixed star coordinates for instant pure-CSS starfield
const STAR_DOTS = [
  { x: 6, y: 10, size: 2, opacity: 0.75 },
  { x: 15, y: 32, size: 1.5, opacity: 0.45 },
  { x: 24, y: 16, size: 2.2, opacity: 0.8 },
  { x: 11, y: 74, size: 1.5, opacity: 0.4 },
  { x: 22, y: 88, size: 2, opacity: 0.65 },
  { x: 36, y: 7, size: 1.5, opacity: 0.5 },
  { x: 44, y: 24, size: 2, opacity: 0.7 },
  { x: 56, y: 12, size: 1.5, opacity: 0.6 },
  { x: 69, y: 29, size: 2, opacity: 0.8 },
  { x: 83, y: 14, size: 1.5, opacity: 0.5 },
  { x: 93, y: 22, size: 2, opacity: 0.75 },
  { x: 89, y: 66, size: 2.5, opacity: 0.85 },
  { x: 75, y: 80, size: 1.5, opacity: 0.4 },
  { x: 86, y: 91, size: 2, opacity: 0.7 },
  { x: 63, y: 93, size: 1.5, opacity: 0.5 },
  { x: 49, y: 84, size: 2, opacity: 0.6 },
  { x: 34, y: 65, size: 1.5, opacity: 0.4 },
  { x: 4, y: 50, size: 2, opacity: 0.6 },
  { x: 96, y: 46, size: 1.5, opacity: 0.5 },
  { x: 18, y: 54, size: 1, opacity: 0.35 },
  { x: 78, y: 44, size: 1.5, opacity: 0.55 },
]

export default function StartMenu() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const launchMission = useGameStore((s) => s.launchMission)
  const setShowDataSourcesModal = useGameStore((s) => s.setShowDataSourcesModal)

  const saved = loadSavedSettings()
  const [commanderName, setCommanderName] = useState(saved.commanderName || 'Commander')
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>(saved.planet || 'mars')
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyId>(
    saved.difficulty || 'commander'
  )
  const [skipTutorial, setSkipTutorial] = useState<boolean>(saved.skipTutorial ?? false)
  const [planetLoaded, setPlanetLoaded] = useState(false)

  if (isGameStarted) {
    return null
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

  const isMars = selectedPlanet === 'mars'
  const planetImgSrc =
    selectedPlanet === 'moon' ? '/assets/menu/planet05.png' : '/assets/menu/planet02.png'

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none overflow-y-auto tech-grid-bg"
      style={{
        background: isMars
          ? 'radial-gradient(ellipse at 50% 0%, rgba(154, 52, 18, 0.28) 0%, rgba(15, 23, 42, 0.92) 48%, #05070e 100%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(14, 116, 144, 0.25) 0%, rgba(15, 23, 42, 0.92) 48%, #05070e 100%)',
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      {/* 1. Ambient Starfield & Orbital Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {STAR_DOTS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Decorative Orbital Arcs */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.07]"
          viewBox="0 0 900 900"
          fill="none"
        >
          <circle cx="450" cy="450" r="320" stroke="white" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="450" cy="450" r="420" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* 2. Floating Planet Render Illustration */}
      <div
        className="absolute -top-12 -right-12 md:-top-16 md:-right-16 w-64 h-64 md:w-[460px] md:h-[460px] pointer-events-none overflow-hidden animate-float-slow"
        aria-hidden="true"
      >
        <div
          className={`absolute inset-8 rounded-full blur-3xl transition-colors duration-700 ${
            isMars ? 'bg-orange-500/15' : 'bg-cyan-400/15'
          }`}
        />
        <img
          src={planetImgSrc}
          alt=""
          loading="lazy"
          onLoad={() => setPlanetLoaded(true)}
          onError={() => setPlanetLoaded(false)}
          className={`w-full h-full object-contain pointer-events-none select-none transition-all duration-700 ${
            planetLoaded ? 'opacity-30 scale-100' : 'opacity-0 scale-95'
          }`}
        />
      </div>

      {/* 3. Main Mission Command Card */}
      <div className="mission-panel rounded-[28px] max-w-xl w-full p-4 sm:p-7 text-white flex flex-col gap-4 my-auto relative z-10 max-h-[93dvh] overflow-y-auto animate-modal-in">
        {/* Top Accent Line */}
        <div
          className={`absolute top-0 left-8 right-8 h-[2px] rounded-full transition-colors duration-500 ${
            isMars
              ? 'bg-gradient-to-r from-transparent via-orange-500/80 to-transparent'
              : 'bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent'
          }`}
        />

        {/* Header: Mission Badge, Title, Tagline */}
        <div className="text-center flex flex-col items-center pt-0.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-[10px] sm:text-[11px] font-mono font-semibold tracking-widest text-orange-300 uppercase mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span>NASA Space Apps Challenge · Mission Trainer</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-white leading-none">
            OUTPOST <span className={isMars ? 'text-orange-400' : 'text-cyan-400'}>ZERO</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/90 mt-2 font-medium tracking-wide max-w-md">
            Survive the Sun. Power the habitat. Explore the unknown across a 20-sol expedition.
          </p>
        </div>

        {/* Commander Callsign Input */}
        <div className="bg-slate-950/55 rounded-2xl p-3.5 border border-white/[0.08] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="commander-name-input"
              className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <AstronautIcon size={15} className="text-orange-400" />
              <span>Welcome, Mission Commander</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
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
              className="w-full min-h-[44px] bg-slate-900/90 border border-white/10 rounded-xl pl-3.5 pr-14 py-2 text-white font-semibold text-sm tracking-wide focus:outline-none focus:border-orange-400/80 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <span className="absolute right-3.5 text-[11px] font-mono text-slate-500 pointer-events-none">
              {commanderName.length}/16
            </span>
          </div>
        </div>

        {/* Destination Selection (Mars vs Moon) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              01 · Select Target Body
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              20-Sol Surface Deployment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Mars Card */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('mars')
              }}
              className={`group p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'mars'
                  ? 'bg-gradient-to-b from-orange-950/60 to-slate-900/90 border-orange-400/80 shadow-[0_0_24px_-4px_rgba(249,115,22,0.35)]'
                  : 'bg-slate-900/55 border-white/[0.08] hover:border-white/20 hover:bg-slate-900/80 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                      selectedPlanet === 'mars'
                        ? 'bg-orange-500/20 border-orange-400/50 text-orange-300'
                        : 'bg-white/5 border-white/10 text-orange-400/80'
                    }`}
                  >
                    <MarsGlobeIcon size={21} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white leading-tight">
                      Mars
                    </h3>
                    <span className="text-[10px] font-mono text-orange-300/90">
                      {PLANETS.mars.tagline}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${
                    selectedPlanet === 'mars'
                      ? 'bg-orange-500 border-orange-300 text-white shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                      : 'border-white/20 bg-transparent text-transparent'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-snug">
                Red regolith, atmospheric dust haze, and a 20s DSN comms delay.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/35 border border-white/[0.07] text-slate-300">
                  <RadarDishIcon size={11} className="text-orange-400" /> 20s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/35 border border-white/[0.07] text-slate-300">
                  <ZapBoltIcon size={11} className="text-emerald-400" /> Standard Drain
                </span>
              </div>
            </button>

            {/* Moon Card */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('moon')
              }}
              className={`group p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-2 min-h-[44px] relative overflow-hidden ${
                selectedPlanet === 'moon'
                  ? 'bg-gradient-to-b from-cyan-950/55 to-slate-900/90 border-cyan-400/80 shadow-[0_0_24px_-4px_rgba(34,211,238,0.32)]'
                  : 'bg-slate-900/55 border-white/[0.08] hover:border-white/20 hover:bg-slate-900/80 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                      selectedPlanet === 'moon'
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <MoonGlobeIcon size={21} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white leading-tight">
                      Moon
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-300/90">
                      {PLANETS.moon.tagline}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${
                    selectedPlanet === 'moon'
                      ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'border-white/20 bg-transparent text-transparent'
                  }`}
                >
                  ✓
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-snug">
                Grey lunar craters, swift 2s Earth link, +10% vacuum battery drain.
              </p>

              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/35 border border-white/[0.07] text-slate-300">
                  <RadarDishIcon size={11} className="text-cyan-400" /> 2s Comms
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/35 border border-white/[0.07] text-amber-300">
                  <ZapBoltIcon size={11} className="text-amber-400" /> +10% Drain
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              02 · Mission Profile & Difficulty
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Real NASA DONKI Weather
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['explorer', 'commander', 'mission_control'] as DifficultyId[]).map((diffKey) => {
              const diff = DIFFICULTIES[diffKey]
              const isSelected = selectedDifficulty === diffKey

              const accentStyles = {
                explorer: isSelected
                  ? 'bg-emerald-950/45 border-emerald-400/80 shadow-[0_0_20px_-4px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/55 border-white/[0.08] hover:border-white/20 opacity-85 hover:opacity-100',
                commander: isSelected
                  ? 'bg-amber-950/45 border-amber-400/80 shadow-[0_0_20px_-4px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/55 border-white/[0.08] hover:border-white/20 opacity-85 hover:opacity-100',
                mission_control: isSelected
                  ? 'bg-purple-950/45 border-purple-400/80 shadow-[0_0_20px_-4px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/55 border-white/[0.08] hover:border-white/20 opacity-85 hover:opacity-100',
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
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 min-h-[44px] ${accentStyles}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display font-bold text-xs sm:text-[13px] text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        {diff.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {diff.ageGroup}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-snug mt-1.5">
                      {diff.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-[10px] font-mono text-slate-300">
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
        <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-950/45 border border-white/[0.07] hover:border-white/15 text-xs text-slate-300 cursor-pointer select-none min-h-[44px] transition-colors">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200 text-xs">
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
            <div className="w-10 h-6 bg-slate-800 border border-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:border-orange-400" />
          </div>
        </label>

        {/* Sticky Launch Mission Button & Data Sources */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-3 pb-1 -mx-4 px-4 sm:-mx-7 sm:px-7 border-t border-white/[0.08] flex flex-col gap-2 mt-auto">
          <button
            onClick={handleLaunch}
            className="group relative overflow-hidden w-full min-h-[50px] py-3.5 px-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 active:from-orange-600 active:to-amber-600 text-white font-display font-bold text-base md:text-lg tracking-wide rounded-2xl transition-all duration-200 cursor-pointer shadow-[0_10px_28px_-6px_rgba(249,115,22,0.55)] flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <RocketIcon size={20} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>Launch Mission</span>
          </button>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                sfx('open_soft', { volume: 0.5 })
                setShowDataSourcesModal(true)
              }}
              className="min-h-[40px] px-3.5 py-1 rounded-full text-xs text-sky-300 hover:text-white hover:bg-white/[0.05] font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <DatabaseScienceIcon size={14} className="text-sky-400" />
              <span>Data Sources & NASA Provenance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
