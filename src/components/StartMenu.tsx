import { useState, useEffect } from 'react'
import { useGameStore, loadSavedSettings } from '../store/gameStore'
import { PlanetId, PLANETS } from '../config/planets'
import { DifficultyId, DIFFICULTIES } from '../config/difficulty'

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
  const [hasIllustration, setHasIllustration] = useState(false)

  // Test if an artist illustration exists in /assets/nasa/illustration.jpg
  useEffect(() => {
    const img = new Image()
    img.src = '/assets/nasa/illustration.jpg'
    img.onload = () => setHasIllustration(true)
    img.onerror = () => setHasIllustration(false)
  }, [])

  if (isGameStarted) {
    return null
  }

  const handleLaunch = () => {
    launchMission({
      commanderName: commanderName.trim() || 'Commander',
      planet: selectedPlanet,
      difficulty: selectedDifficulty,
      skipTutorial,
    })
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 pointer-events-auto select-none overflow-y-auto">
      <div className="bg-slate-900/95 border-2 border-orange-500/70 rounded-3xl max-w-xl w-full p-6 md:p-8 text-white shadow-2xl flex flex-col gap-5 my-auto">
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

        {/* Optional NASA Illustration (Only if available, labeled as artist drawing) */}
        {hasIllustration && (
          <div className="relative w-full bg-black/60 rounded-2xl p-2 border border-slate-800 flex flex-col items-center">
            <img
              src="/assets/nasa/illustration.jpg"
              alt="NASA Concept Illustration"
              className="max-h-36 w-full object-contain rounded-xl"
            />
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Illustration: NASA/JPL-Caltech
            </span>
          </div>
        )}

        {/* Commander Name Input */}
        <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 flex flex-col gap-1.5">
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
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm tracking-wide focus:outline-none focus:border-orange-500 transition-colors"
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
              onClick={() => setSelectedPlanet('mars')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                selectedPlanet === 'mars'
                  ? 'bg-orange-950/60 border-orange-500 shadow-lg shadow-orange-950/50 scale-[1.02]'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 opacity-80'
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
              onClick={() => setSelectedPlanet('moon')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                selectedPlanet === 'moon'
                  ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 opacity-80'
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
                  onClick={() => setSelectedDifficulty(diffKey)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-500 opacity-80'
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
            onChange={(e) => setSkipTutorial(e.target.checked)}
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
            onClick={() => setShowDataSourcesModal(true)}
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

