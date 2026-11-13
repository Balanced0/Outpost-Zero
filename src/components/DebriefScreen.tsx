import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { PLANETS } from '../config/planets'
import { DIFFICULTIES } from '../config/difficulty'
import {
  STAR_SURVIVAL_DAYS,
  STAR3_MIN_CREW_HEALTH,
  STAR3_MIN_AIR,
} from '../config/balance'
import {
  evaluateBiggestMistake,
  evaluateSmartestMove,
  DayLogEntry,
} from '../data/debrief'

export default function DebriefScreen() {
  const isDebriefOpen = useGameStore((s) => s.isDebriefOpen)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const commanderName = useGameStore((s) => s.commanderName)
  const planet = useGameStore((s) => s.planet)
  const difficulty = useGameStore((s) => s.difficulty)
  const dayLogs = useGameStore((s) => s.dayLogs)
  const totalDiscoveryPoints = useGameStore((s) => s.totalDiscoveryPoints)
  const air = useGameStore((s) => s.air)
  const crewHealth = useGameStore((s) => s.crewHealth)
  const spaceWeatherSource = useGameStore((s) => s.spaceWeatherSource)

  const playAgain = useGameStore((s) => s.playAgain)
  const tryHarderMode = useGameStore((s) => s.tryHarderMode)
  const switchPlanet = useGameStore((s) => s.switchPlanet)
  const returnToMenu = useGameStore((s) => s.returnToMenu)
  const setShowDataSourcesModal = useGameStore((s) => s.setShowDataSourcesModal)

  const [selectedDayLog, setSelectedDayLog] = useState<DayLogEntry | null>(null)

  if (!isDebriefOpen) {
    return null
  }

  const diffConfig = DIFFICULTIES[difficulty]
  const goal = diffConfig.discoveryGoal
  const survived = !isAirDepleted && !isCrewDepleted
  const daysSurvived = dayLogs.length

  // Calculate Stars (1 to 3 stars, or 0 if crew didn't survive)
  let stars = 0
  if (survived && daysSurvived >= STAR_SURVIVAL_DAYS) {
    stars = 1
    if (totalDiscoveryPoints >= goal) {
      stars = 2
      if (crewHealth >= STAR3_MIN_CREW_HEALTH && air >= STAR3_MIN_AIR) {
        stars = 3
      }
    }
  }

  const biggestMistake = evaluateBiggestMistake(dayLogs)
  const smartestMove = evaluateSmartestMove(dayLogs)

  // Selected or latest day log for detail card
  const activeDotLog = selectedDayLog || (dayLogs.length > 0 ? dayLogs[dayLogs.length - 1] : null)

  const isMaxDifficulty = difficulty === 'mission_control'

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 pointer-events-auto select-none overflow-y-auto">
      <div className="bg-slate-900 border-2 border-orange-500/70 rounded-3xl max-w-2xl w-full p-5 md:p-7 text-white shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header: Stars or Mission Paused */}
        <div className="text-center flex flex-col items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 font-mono">
              Outpost Zero • {PLANETS[planet].name} • {diffConfig.name}
            </span>
          </div>

          {survived && daysSurvived >= STAR_SURVIVAL_DAYS ? (
            <div className="flex flex-col items-center mt-1">
              <div className="flex items-center gap-1.5 text-3xl md:text-4xl my-1 animate-pulse">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={s <= stars ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-700 opacity-40'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-black text-white">
                Mission Complete, Commander {commanderName}!
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {stars === 3
                  ? 'Outstanding leadership! Full survival, hit science goal, and kept the base thriving.'
                  : stars === 2
                  ? 'Great mission! All 20 days survived and scientific discovery goal reached.'
                  : 'Mission survived! You brought the outpost home through 20 challenging sols.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl mb-1.5">
                {isCrewDepleted ? '☀️' : '🫁'}
              </div>
              <h2 className="text-2xl font-black text-amber-300">
                Mission paused
              </h2>
              <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
                {isCrewDepleted
                  ? 'The crew got too much radiation. Real mission planners always check space weather and keep strong shielding ready.'
                  : 'The astronauts ran low on air. Real mission planners always keep extra air in reserve.'}
              </p>
            </div>
          )}
        </div>

        {/* Mission Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700 flex flex-col text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Days Survived
            </span>
            <span className="text-lg font-bold font-mono text-white mt-0.5">
              {daysSurvived} / 20
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700 flex flex-col text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Science Goal
            </span>
            <span
              className={`text-lg font-bold font-mono mt-0.5 ${
                totalDiscoveryPoints >= goal ? 'text-amber-300' : 'text-slate-200'
              }`}
            >
              {totalDiscoveryPoints} / {goal} pts
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700 flex flex-col text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Final Crew Health
            </span>
            <span
              className={`text-lg font-bold font-mono mt-0.5 ${
                crewHealth >= 60 ? 'text-emerald-400' : crewHealth > 0 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {Math.round(crewHealth)}%
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700 flex flex-col text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Final Air Reserve
            </span>
            <span
              className={`text-lg font-bold font-mono mt-0.5 ${
                air >= 40 ? 'text-cyan-400' : air > 0 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {Math.round(air)}%
            </span>
          </div>
        </div>

        {/* Mission Timeline: Row of 20 Day Dots */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              Your Mission Timeline (Tap a day)
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Calm
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Storm Safe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Storm Hurt
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Stranded
              </span>
            </div>
          </div>

          {/* Dots container */}
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 py-1 justify-items-center">
            {Array.from({ length: 20 }, (_, i) => {
              const dayNum = i + 1
              const entry = dayLogs.find((l) => l.day === dayNum)
              const isSelected = activeDotLog?.day === dayNum

              let dotColor = 'border border-slate-700 bg-slate-900 opacity-40'
              if (entry) {
                if (entry.outcome === 'calm') dotColor = 'bg-emerald-400'
                else if (entry.outcome === 'storm_survived') dotColor = 'bg-sky-400'
                else if (entry.outcome === 'storm_hurt') dotColor = 'bg-amber-400'
                else if (entry.outcome === 'stranded') dotColor = 'bg-purple-400'
                else if (entry.outcome === 'paused') dotColor = 'bg-rose-500'
              }

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => entry && setSelectedDayLog(entry)}
                  disabled={!entry}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-transform cursor-pointer ${dotColor} ${
                    isSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'hover:scale-105'
                  }`}
                  title={entry ? `Day ${dayNum}: ${entry.outcome}` : `Day ${dayNum}: Not reached`}
                >
                  <span className={entry ? 'text-slate-950 font-black' : 'text-slate-500'}>
                    {dayNum}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Selected Day Short Summary */}
          {activeDotLog && (
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700 text-xs flex flex-col gap-1 animate-fade-in">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>Day {activeDotLog.day} Log:</span>
                <span className="font-mono text-[11px] text-amber-300">
                  {activeDotLog.stormLevel === 'none'
                    ? '☀️ Calm Skies'
                    : `⚠️ ${activeDotLog.stormLevel.toUpperCase()} Storm (Str ${activeDotLog.stormStrength})`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] text-slate-300 font-mono">
                <span>Shield: {activeDotLog.shieldStrength}%</span>
                <span>Damage: -{activeDotLog.crewDamage}%</span>
                <span>Air: {activeDotLog.airAfter}% ({activeDotLog.airDrop >= 0 ? `-${activeDotLog.airDrop}%` : 'balanced'})</span>
                <span>Discoveries: +{activeDotLog.discoveryPoints} pts</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Rover status: {activeDotLog.madeItHome ? 'Returned home safe 🏠' : 'Stranded outside at sunset ⛺'}
              </div>
            </div>
          )}
        </div>

        {/* Debrief Insights: Biggest Mistake & Smartest Move */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {/* Biggest Mistake Card */}
          <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-red-300">
              <span>⚠️</span>
              <span>Biggest Mistake</span>
            </div>
            <h4 className="font-semibold text-slate-200 text-xs">
              {biggestMistake.title}
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              {biggestMistake.detail}
            </p>
            {biggestMistake.nasaWisdom && (
              <div className="mt-auto pt-1.5 border-t border-red-900/50 text-[10px] text-amber-300/90 italic leading-tight">
                <span className="font-semibold text-white">What real NASA planners do: </span>
                {biggestMistake.nasaWisdom}
              </div>
            )}
          </div>

          {/* Smartest Move Card */}
          {smartestMove && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <span>🌟</span>
                <span>Smartest Move</span>
              </div>
              <h4 className="font-semibold text-slate-200 text-xs">
                {smartestMove.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                {smartestMove.detail}
              </p>
            </div>
          )}
        </div>

        {/* Honest NASA Space Weather Source Disclaimer */}
        <div className="text-[11px] text-center text-slate-400 italic">
          {spaceWeatherSource === 'live'
            ? 'This mission replayed live space weather observations from NASA DONKI.'
            : spaceWeatherSource === 'saved'
            ? 'This mission replayed saved NASA space weather data from recorded solar events.'
            : 'This mission used a simulated NASA-calibrated solar activity profile.'}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={playAgain}
              className="py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shadow-md"
            >
              Play again
            </button>

            <button
              type="button"
              onClick={tryHarderMode}
              disabled={isMaxDifficulty}
              className={`py-3 px-4 font-bold rounded-xl transition-colors text-xs shadow-md ${
                isMaxDifficulty
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white cursor-pointer'
              }`}
            >
              {isMaxDifficulty ? 'Hardest mode reached' : 'Try a harder mode'}
            </button>

            <button
              type="button"
              onClick={switchPlanet}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs border border-slate-700 shadow-md"
            >
              Switch to {planet === 'mars' ? 'Moon ⚪' : 'Mars 🔴'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={returnToMenu}
              className="text-xs text-slate-400 hover:text-white underline font-semibold cursor-pointer"
            >
              ← Return to Menu
            </button>

            <button
              type="button"
              onClick={() => setShowDataSourcesModal(true)}
              className="text-xs text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>🔬</span>
              <span>Data sources</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

