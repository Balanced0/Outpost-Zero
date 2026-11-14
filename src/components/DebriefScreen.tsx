import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { PLANETS } from '../config/planets'
import { DIFFICULTIES } from '../config/difficulty'
import { sfx } from '../utils/sound'
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

// ── Step dots ───────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-5 h-2.5 bg-orange-400'
              : i + 1 < current
              ? 'w-2.5 h-2.5 bg-orange-700'
              : 'w-2.5 h-2.5 bg-slate-700'
          }`}
        />
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

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

  const [step, setStep] = useState(1)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedDayLog, setSelectedDayLog] = useState<DayLogEntry | null>(null)
  const [wasOpen, setWasOpen] = useState(false)

  if (isDebriefOpen && !wasOpen) {
    setWasOpen(true)
    setStep(1)
    setDetailsOpen(false)
  } else if (!isDebriefOpen && wasOpen) {
    setWasOpen(false)
  }

  if (!isDebriefOpen) return null

  const diffConfig = DIFFICULTIES[difficulty]
  const goal = diffConfig.discoveryGoal
  const survived = !isAirDepleted && !isCrewDepleted
  const daysSurvived = dayLogs.length
  const isMissionControl = difficulty === 'mission_control'
  const isMaxDifficulty = isMissionControl

  // Stars
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

  // One-line summary for step 1
  const headline = survived && daysSurvived >= STAR_SURVIVAL_DAYS
    ? (stars === 3
        ? `Outstanding, Commander ${commanderName}!`
        : stars === 2
        ? `Great mission, Commander ${commanderName}!`
        : `Mission survived, Commander ${commanderName}!`)
    : `Mission paused, Commander ${commanderName}.`

  const subline = survived && daysSurvived >= STAR_SURVIVAL_DAYS
    ? (stars === 3
        ? 'Full survival, science goal hit, and the base stayed healthy. Perfect!'
        : stars === 2
        ? 'All 20 days survived and your science goal was reached.'
        : 'You kept the outpost going through 20 challenging sols.')
    : (isCrewDepleted
        ? 'The crew got too much radiation. Next time, keep your shield strong!'
        : 'The base ran low on air. Try keeping more power on the air machine.')

  const activeDotLog = selectedDayLog || (dayLogs.length > 0 ? dayLogs[dayLogs.length - 1] : null)

  function goNext() {
    sfx('click_soft', { volume: 0.5 })
    setStep((s) => s + 1)
  }

  const cardBase = 'flex flex-col flex-1 min-h-0 gap-5 items-center justify-center text-center px-2 animate-fade-in'

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto select-none bg-black/92 backdrop-blur-sm"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div
        className="bg-slate-900/97 border-2 border-orange-500/70 rounded-3xl max-w-sm w-full mx-3 shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Top bar */}
        <div className="px-5 pt-4 pb-2 flex flex-col items-center gap-1 border-b border-slate-800">
          <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase font-mono">
            {PLANETS[planet].name} · {diffConfig.name}
          </span>
          <StepDots current={step} total={3} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* ── STEP 1: Stars & one sentence ── */}
          {step === 1 && (
            <div className={cardBase}>
              {/* Stars or fail icon */}
              {survived && daysSurvived >= STAR_SURVIVAL_DAYS ? (
                <div className="flex items-center gap-2 text-5xl">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={
                        s <= stars
                          ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                          : 'text-slate-700 opacity-30'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-6xl">{isCrewDepleted ? '☀️' : '🫁'}</div>
              )}

              <div>
                <h2 className="text-2xl font-black text-white leading-tight">{headline}</h2>
                <p className="text-base text-slate-300 mt-2 leading-relaxed max-w-[260px] mx-auto">
                  {subline}
                </p>
              </div>

              {/* Quick stats: days + points */}
              <div className="flex gap-4">
                <div className="bg-slate-800/70 border border-slate-700 rounded-2xl px-5 py-3 flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{daysSurvived}</span>
                  <span className="text-xs text-slate-400 mt-0.5">days survived</span>
                </div>
                <div className="bg-slate-800/70 border border-slate-700 rounded-2xl px-5 py-3 flex flex-col items-center">
                  <span className={`text-2xl font-black ${totalDiscoveryPoints >= goal ? 'text-amber-300' : 'text-white'}`}>
                    {totalDiscoveryPoints}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">of {goal} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Biggest mistake + smartest move ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4 w-full animate-fade-in">
              <div className="text-center">
                <div className="text-4xl mb-1">📋</div>
                <h2 className="text-xl font-black text-white">How did you do?</h2>
              </div>

              {/* Biggest mistake */}
              <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-4 flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
                  <span>⚠️</span>
                  <span>Biggest mistake</span>
                </div>
                <p className="text-base font-semibold text-slate-200">{biggestMistake.title}</p>
                <p className="text-sm text-slate-300 leading-snug">{biggestMistake.detail}</p>
                {biggestMistake.nasaWisdom && (
                  <div className="border-t border-red-900/50 pt-2 text-xs text-amber-300/90 italic leading-snug">
                    <span className="font-semibold text-white not-italic">NASA tip: </span>
                    {biggestMistake.nasaWisdom}
                  </div>
                )}
              </div>

              {/* Smartest move */}
              {smartestMove ? (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-2 text-left">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <span>🌟</span>
                    <span>Smartest move</span>
                  </div>
                  <p className="text-base font-semibold text-slate-200">{smartestMove.title}</p>
                  <p className="text-sm text-slate-300 leading-snug">{smartestMove.detail}</p>
                </div>
              ) : (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 text-sm text-slate-400 text-center italic">
                  Every mission teaches something new. Keep exploring! 🚀
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Play again + details ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4 w-full animate-fade-in">
              <div className="text-center">
                <div className="text-4xl mb-1">🚀</div>
                <h2 className="text-xl font-black text-white">What's next?</h2>
              </div>

              {/* Three action buttons */}
              <button
                type="button"
                onClick={() => { sfx('confirm', { volume: 0.6 }); playAgain() }}
                className="w-full min-h-[52px] py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-lg text-base active:scale-[0.99]"
              >
                Play again 🔄
              </button>

              <button
                type="button"
                onClick={() => { sfx('confirm', { volume: 0.6 }); tryHarderMode() }}
                disabled={isMaxDifficulty}
                className={`w-full min-h-[52px] py-3.5 font-extrabold rounded-2xl transition-colors text-base shadow-md ${
                  isMaxDifficulty
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isMaxDifficulty ? 'Already on hardest mode 🏆' : 'Try a harder mode ⬆️'}
              </button>

              <button
                type="button"
                onClick={() => { sfx('confirm', { volume: 0.6 }); switchPlanet() }}
                className="w-full min-h-[52px] py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-white font-extrabold rounded-2xl transition-colors cursor-pointer border border-slate-700 shadow-md text-base active:scale-[0.99]"
              >
                Switch to {planet === 'mars' ? 'Moon ⚪' : 'Mars 🔴'}
              </button>

              {/* See details toggle */}
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer self-center py-1 min-h-[36px]"
              >
                {detailsOpen ? 'Hide details ▲' : 'See details ▼'}
              </button>

              {/* Collapsed details section */}
              {detailsOpen && (
                <div className="flex flex-col gap-3 text-xs animate-fade-in">

                  {/* Mission stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Days survived', value: `${daysSurvived} / 20`, color: 'text-white' },
                      { label: 'Science goal', value: `${totalDiscoveryPoints} / ${goal} pts`, color: totalDiscoveryPoints >= goal ? 'text-amber-300' : 'text-white' },
                      { label: 'Final crew health', value: `${Math.round(crewHealth)}%`, color: crewHealth >= 60 ? 'text-emerald-400' : crewHealth > 0 ? 'text-amber-400' : 'text-red-400' },
                      { label: 'Final air reserve', value: `${Math.round(air)}%`, color: air >= 40 ? 'text-cyan-400' : air > 0 ? 'text-amber-400' : 'text-red-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700 text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{label}</div>
                        <div className={`text-base font-bold font-mono mt-0.5 ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mission timeline */}
                  <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/80 flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mission timeline (tap a day)
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-start py-1">
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
                            onClick={() => {
                              if (entry) {
                                sfx('click_soft', { volume: 0.5 })
                                setSelectedDayLog(entry)
                              }
                            }}
                            disabled={!entry}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-transform cursor-pointer ${dotColor} ${
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

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                      {[
                        { color: 'bg-emerald-400', label: 'Calm' },
                        { color: 'bg-sky-400', label: 'Storm safe' },
                        { color: 'bg-amber-400', label: 'Storm hurt' },
                        { color: 'bg-purple-400', label: 'Stranded' },
                      ].map(({ color, label }) => (
                        <span key={label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Selected day log */}
                    {activeDotLog && (
                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700 text-xs flex flex-col gap-1 animate-fade-in">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>Day {activeDotLog.day} Log:</span>
                          <span className="font-mono text-[11px] text-amber-300">
                            {activeDotLog.stormLevel === 'none'
                              ? '☀️ Calm'
                              : `⚠️ ${activeDotLog.stormLevel.toUpperCase()} Storm`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
                          <span>Shield: {activeDotLog.shieldStrength}%</span>
                          <span>Damage: −{activeDotLog.crewDamage}%</span>
                          <span>Air after: {activeDotLog.airAfter}%</span>
                          <span>Finds: +{activeDotLog.discoveryPoints} pts</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Rover: {activeDotLog.madeItHome ? 'Returned safe 🏠' : 'Stranded at sunset ⛺'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* NASA source disclaimer */}
                  <div className="text-[11px] text-center text-slate-400 italic">
                    {spaceWeatherSource === 'live'
                      ? 'This mission used live space weather from NASA DONKI.'
                      : spaceWeatherSource === 'saved'
                      ? 'This mission used saved NASA space weather data.'
                      : 'This mission used a simulated NASA-calibrated solar profile.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-slate-800 px-5 py-4 bg-slate-900/95 flex-shrink-0 flex flex-col gap-2">
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full min-h-[52px] py-3.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-lg tracking-wide active:scale-[0.99]"
            >
              Next →
            </button>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => { sfx('toggle', { volume: 0.5 }); returnToMenu() }}
                className="min-h-[44px] px-2 text-xs text-slate-400 hover:text-white underline font-semibold cursor-pointer flex items-center"
              >
                ← Return to Menu
              </button>
              <button
                type="button"
                onClick={() => setShowDataSourcesModal(true)}
                className="min-h-[44px] px-2 text-xs text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>🔬</span>
                <span>Data sources</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
