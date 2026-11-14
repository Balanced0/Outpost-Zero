import { useState } from 'react'
import { useGameStore, loadSavedSettings } from '../store/gameStore'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'
import { sfx } from '../utils/sound'

// Lightweight fixed star coordinates for instant pure-CSS starfield (zero JS calculation)
const STAR_DOTS = [
  { x: 8,  y: 12, size: 2, opacity: 0.7 },
  { x: 18, y: 35, size: 1.5, opacity: 0.5 },
  { x: 28, y: 18, size: 2, opacity: 0.8 },
  { x: 12, y: 72, size: 1.5, opacity: 0.4 },
  { x: 24, y: 88, size: 2, opacity: 0.6 },
  { x: 38, y: 8,  size: 1.5, opacity: 0.5 },
  { x: 45, y: 28, size: 2, opacity: 0.7 },
  { x: 55, y: 15, size: 1.5, opacity: 0.6 },
  { x: 68, y: 32, size: 2, opacity: 0.8 },
  { x: 82, y: 14, size: 1.5, opacity: 0.5 },
  { x: 92, y: 22, size: 2, opacity: 0.7 },
  { x: 88, y: 65, size: 2.5, opacity: 0.85 },
  { x: 74, y: 78, size: 1.5, opacity: 0.4 },
  { x: 85, y: 90, size: 2, opacity: 0.7 },
  { x: 62, y: 92, size: 1.5, opacity: 0.5 },
  { x: 48, y: 82, size: 2, opacity: 0.6 },
  { x: 35, y: 64, size: 1.5, opacity: 0.4 },
  { x: 5,  y: 50, size: 2, opacity: 0.6 },
  { x: 95, y: 48, size: 1.5, opacity: 0.5 },
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

  // Pre-resized (max 600px, ~75KB) Kenney planet illustrations
  const planetImgSrc =
    selectedPlanet === 'moon' ? '/assets/menu/planet05.png' : '/assets/menu/planet02.png'

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #151a34 0%, #090c1e 52%, #020308 100%)',
      }}
    >
      {/* 1. Plain CSS Starfield Dots — zero JS, 100% reliable background */}
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
      </div>

      {/* 2. Optional Resized Kenney Planet Image — fades in gently on top of gradient without blocking render */}
      <div
        className="absolute -top-12 -right-12 md:-top-16 md:-right-16 w-72 h-72 md:w-[440px] md:h-[440px] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={planetImgSrc}
          alt=""
          loading="lazy"
          onLoad={() => setPlanetLoaded(true)}
          onError={() => setPlanetLoaded(false)}
          className={`w-full h-full object-contain pointer-events-none select-none transition-opacity duration-1000 ${
            planetLoaded ? 'opacity-25' : 'opacity-0'
          }`}
        />
      </div>

      {/* 3. Main Start Menu Card — Crisp, solid background (no heavy backdrop-blur) */}
      <div className="bg-slate-900 border-2 border-orange-500/70 rounded-3xl max-w-xl w-full p-6 md:p-8 text-white shadow-2xl flex flex-col gap-5 my-auto relative z-10">
        {/* Title & Tagline */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-[11px] font-bold tracking-widest text-orange-400 uppercase mb-2">
            <span>🚀</span>
            <span>NASA Space Apps Challenge</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            Outpost Zero
          </h1>
          <p className="text-sm md:text-base font-semibold text-orange-300/90 mt-1 italic tracking-wide">
            Explore far. Stay alive. Nothing is free.
          </p>
        </div>

        {/* Commander Name Input */}
        <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/80 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🧑‍🚀</span>
            <span>Welcome, Mission Commander</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              maxLength={16}
              value={commanderName}
              onChange={(e) => setCommanderName(e.target.value)}
              placeholder="Commander"
              className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm tracking-wide focus:outline-none focus:border-orange-500 transition-colors"
            />
            <span className="absolute right-3 text-[11px] font-mono text-slate-500">
              {commanderName.length}/16
            </span>
          </div>
        </div>

        {/* Planet Selection (Two Big Cards) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Choose Your Destination
          </span>
          <div className="grid grid-cols-2 gap-3">
            {/* Mars Card */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('mars')
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                selectedPlanet === 'mars'
                  ? 'bg-orange-950/70 border-orange-500 shadow-lg shadow-orange-950/50 scale-[1.02]'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-500 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🔴</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                  {PLANETS.mars.tagline}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Mars</h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Red ground, dust haze, and a 20s comms delay.
                </p>
              </div>
            </button>

            {/* Moon Card */}
            <button
              type="button"
              onClick={() => {
                sfx('toggle', { volume: 0.5 })
                setSelectedPlanet('moon')
              }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                selectedPlanet === 'moon'
                  ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-500 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚪</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {PLANETS.moon.tagline}
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Moon</h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Grey surface, swift 2s delay, but battery drains 10% faster.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Difficulty Selection (Three Modes) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Choose Difficulty
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['explorer', 'commander', 'mission_control'] as DifficultyId[]).map((diffKey) => {
              const diff = DIFFICULTIES[diffKey]
              const isSelected = selectedDifficulty === diffKey
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => {
                    sfx('click_soft', { volume: 0.55 })
                    setSelectedDifficulty(diffKey)
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-500 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{diff.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {diff.ageGroup.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {diff.ageGroup}
                  </span>
                  <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                    {diff.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Skip Tutorial Checkbox */}
        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipTutorial}
            onChange={(e) => {
              sfx('tick', { volume: 0.4 })
              setSkipTutorial(e.target.checked)
            }}
            className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
          />
          <span>Skip tutorial (recommended if you've already played)</span>
        </label>

        {/* Launch Mission Button */}
        <button
          onClick={handleLaunch}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 text-white font-extrabold text-base md:text-lg rounded-2xl transition-all cursor-pointer shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>Launch mission</span>
        </button>

        {/* Data Sources Link */}
        <div className="flex items-center justify-center pt-0.5">
          <button
            type="button"
            onClick={() => {
              sfx('open_soft', { volume: 0.5 })
              setShowDataSourcesModal(true)
            }}
            className="text-xs text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <span>🔬</span>
            <span>Data Sources & NASA Attribution</span>
          </button>
        </div>
      </div>
    </div>
  )
}
