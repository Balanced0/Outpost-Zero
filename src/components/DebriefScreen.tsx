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
import {
  StarRatingIcon,
  RocketIcon,
  DatabaseScienceIcon,
  AlertTriangleIcon,
  AirLifeSupportIcon,
  SunCalmIcon,
} from './icons/MissionIcons'

// ── Step dots ───────────────────────────────────────────────────────────────

function StepDots({
  current,
  total,
  onSelect,
}: {
  current: number
  total: number
  onSelect?: (step: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect?.(idx)}
            aria-label={`Go to step ${idx}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              idx === current
                ? 'w-6 h-2 bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]'
                : idx < current
                ? 'w-2 h-2 bg-orange-600/80 hover:bg-orange-400'
                : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        )
      })}
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
  const headline =
    survived && daysSurvived >= STAR_SURVIVAL_DAYS
      ? stars === 3
        ? `Outstanding, Commander ${commanderName}!`
        : stars === 2
        ? `Great mission, Commander ${commanderName}!`
        : `Mission survived, Commander ${commanderName}!`
      : `Mission paused, Commander ${commanderName}.`

  const subline =
    survived && daysSurvived >= STAR_SURVIVAL_DAYS
      ? stars === 3
        ? 'Full survival, science goal hit, and the base stayed healthy. Perfect!'
        : stars === 2
        ? 'All 20 days survived and your science goal was reached.'
        : 'You kept the outpost going through 20 challenging sols.'
      : isCrewDepleted
      ? 'The crew got too much radiation. Next time, keep your shield strong!'
      : 'The base ran low on air. Try keeping more power on the air machine.'

  const activeDotLog =
    selectedDayLog || (dayLogs.length > 0 ? dayLogs[dayLogs.length - 1] : null)

  function goNext() {
    sfx('click_soft', { volume: 0.5 })
    setStep((s) => s + 1)
  }

  const cardBase =
    'flex flex-col flex-1 min-h-0 gap-5 items-center justify-center text-center px-2 animate-fade-in'

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto select-none bg-[#04060d]/90 backdrop-blur-md"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div
        className="mission-panel rounded-[28px] max-w-md w-full mx-3 flex flex-col overflow-hidden animate-modal-in relative"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent"
          aria-hidden="true"
        />

        {/* Top bar */}
        <div className="px-5 pt-4 pb-2.5 flex flex-col items-center gap-1.5 border-b border-white/[0.08]">
          <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase font-mono">
            {PLANETS[planet].name} · {diffConfig.name} · Mission Debrief
          </span>
          <StepDots
            current={step}
            total={3}
            onSelect={(target) => {
              sfx('click_soft', { volume: 0.4 })
              setStep(target)
            }}
          />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {/* ── STEP 1: Stars & one sentence ── */}
          {step === 1 && (
            <div className={cardBase}>
              {/* Stars or fail icon */}
              {survived && daysSurvived >= STAR_SURVIVAL_DAYS ? (
                <div className="flex items-center gap-2.5 py-1">
                  {[1, 2, 3].map((s) => {
                    const active = s <= stars
                    return (
                      <div
                        key={s}
                        className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                          active
                            ? 'bg-amber-500/15 border-amber-400/50 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.3)]'
                            : 'bg-slate-900/60 border-white/10 text-slate-700'
                        }`}
                      >
                        <StarRatingIcon size={30} filled={active} />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  {isCrewDepleted ? <SunCalmIcon size={38} /> : <AirLifeSupportIcon size={38} />}
                </div>
              )}

              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {headline}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-[280px] mx-auto">
                  {subline}
                </p>
              </div>

              {/* Quick stats: days + points */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                <div className="bg-slate-950/65 border border-white/[0.08] rounded-2xl px-4 py-3 flex flex-col items-center">
                  <span className="font-mono text-2xl font-bold text-white">{daysSurvived}</span>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                    days survived
                  </span>
                </div>
                <div className="bg-slate-950/65 border border-white/[0.08] rounded-2xl px-4 py-3 flex flex-col items-center">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      totalDiscoveryPoints >= goal ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {totalDiscoveryPoints}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                    of {goal} pts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Biggest mistake + smartest move ── */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5 w-full animate-fade-in">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Flight Director Analysis
                </span>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">
                  How did you do?
                </h2>
              </div>

              {/* Biggest mistake */}
              <div className="bg-rose-950/30 border border-rose-500/35 rounded-2xl p-4 flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 font-mono font-bold text-rose-300 text-xs uppercase tracking-wider">
                  <AlertTriangleIcon size={15} />
                  <span>Biggest mistake</span>
                </div>
                <p className="font-display text-base font-bold text-white">
                  {biggestMistake.title}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {biggestMistake.detail}
                </p>
                {biggestMistake.nasaWisdom && (
                  <div className="border-t border-rose-500/20 pt-2.5 mt-0.5 text-xs text-amber-200/90 leading-snug">
                    <span className="font-mono font-bold text-amber-400 uppercase text-[10px] tracking-wider block mb-0.5">
                      NASA Flight Rule:
                    </span>
                    {biggestMistake.nasaWisdom}
                  </div>
                )}
              </div>

              {/* Smartest move */}
              {smartestMove ? (
                <div className="bg-emerald-950/30 border border-emerald-500/35 rounded-2xl p-4 flex flex-col gap-2 text-left">
                  <div className="flex items-center gap-2 font-mono font-bold text-emerald-300 text-xs uppercase tracking-wider">
                    <span>🌟</span>
                    <span>Smartest move</span>
                  </div>
                  <p className="font-display text-base font-bold text-white">
                    {smartestMove.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {smartestMove.detail}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950/50 border border-white/[0.07] rounded-2xl p-4 text-xs sm:text-sm text-slate-400 text-center italic">
                  Every mission teaches something new. Keep exploring!
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Play again + details ── */}
          {step === 3 && (
            <div className="flex flex-col gap-3 w-full animate-fade-in">
              <div className="text-center mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Next Deployment
                </span>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">
                  What&apos;s next?
                </h2>
              </div>

              {/* Three action buttons */}
              <button
                type="button"
                onClick={() => {
                  sfx('confirm', { volume: 0.6 })
                  playAgain()
                }}
                className="w-full min-h-[48px] py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-sm sm:text-base active:scale-[0.99]"
              >
                Play again 🔄
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx('confirm', { volume: 0.6 })
                  tryHarderMode()
                }}
                disabled={isMaxDifficulty}
                className={`w-full min-h-[48px] py-3 font-display font-bold rounded-2xl transition-all text-sm sm:text-base ${
                  isMaxDifficulty
                    ? 'bg-slate-900/70 text-slate-500 border border-white/[0.06] cursor-not-allowed'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isMaxDifficulty ? 'Already on hardest mode 🏆' : 'Try a harder mode ⬆️'}
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx('confirm', { volume: 0.6 })
                  switchPlanet()
                }}
                className="w-full min-h-[48px] py-3 bg-slate-900/80 hover:bg-slate-800 text-white font-display font-bold rounded-2xl transition-all cursor-pointer border border-white/10 text-sm sm:text-base active:scale-[0.99]"
              >
                Switch to {planet === 'mars' ? 'Moon ⚪' : 'Mars 🔴'}
              </button>

              {/* See details toggle */}
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer self-center py-1 min-h-[36px]"
              >
                {detailsOpen ? 'Hide mission log ▲' : 'See 20-Sol mission log ▼'}
              </button>

              {/* Collapsed details section */}
              {detailsOpen && (
                <div className="flex flex-col gap-3 text-xs animate-fade-in">
                  {/* Mission stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Days survived',
                        value: `${daysSurvived} / 20`,
                        color: 'text-white',
                      },
                      {
                        label: 'Science goal',
                        value: `${totalDiscoveryPoints} / ${goal} pts`,
                        color: totalDiscoveryPoints >= goal ? 'text-amber-300' : 'text-white',
                      },
                      {
                        label: 'Final crew health',
                        value: `${Math.round(crewHealth)}%`,
                        color:
                          crewHealth >= 60
                            ? 'text-emerald-300'
                            : crewHealth > 0
                            ? 'text-amber-300'
                            : 'text-rose-400',
                      },
                      {
                        label: 'Final air reserve',
                        value: `${Math.round(air)}%`,
                        color:
                          air >= 40
                            ? 'text-cyan-300'
                            : air > 0
                            ? 'text-amber-300'
                            : 'text-rose-400',
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="bg-slate-950/65 rounded-xl p-2.5 border border-white/[0.07] text-center"
                      >
                        <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                          {label}
                        </div>
                        <div className={`text-base font-bold font-mono mt-0.5 ${color}`}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mission timeline */}
                  <div className="bg-slate-950/65 rounded-2xl p-3 border border-white/[0.08] flex flex-col gap-2.5">
                    <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Mission timeline (tap a sol)
                    </div>
                    <div className="grid grid-cols-10 gap-1.5 py-0.5">
                      {Array.from({ length: 20 }, (_, i) => {
                        const dayNum = i + 1
                        const entry = dayLogs.find((l) => l.day === dayNum)
                        const isSelected = activeDotLog?.day === dayNum

                        let dotColor = 'border border-white/10 bg-slate-900 opacity-35'
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
                            className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono transition-all cursor-pointer ${dotColor} ${
                              isSelected
                                ? 'ring-2 ring-white scale-105 shadow-md'
                                : 'hover:opacity-90'
                            }`}
                            title={
                              entry
                                ? `Day ${dayNum}: ${entry.outcome}`
                                : `Day ${dayNum}: Not reached`
                            }
                          >
                            <span
                              className={entry ? 'text-slate-950 font-black' : 'text-slate-500'}
                            >
                              {dayNum}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-slate-400">
                      {[
                        { color: 'bg-emerald-400', label: 'Calm' },
                        { color: 'bg-sky-400', label: 'Storm safe' },
                        { color: 'bg-amber-400', label: 'Storm hurt' },
                        { color: 'bg-purple-400', label: 'Stranded' },
                      ].map(({ color, label }) => (
                        <span key={label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-sm ${color} inline-block`} />
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Selected day log */}
                    {activeDotLog && (
                      <div className="bg-slate-900/90 rounded-xl p-2.5 border border-white/[0.08] text-xs flex flex-col gap-1 animate-fade-in">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span className="font-display">Sol {activeDotLog.day} Telemetry:</span>
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
                        <div className="text-[10px] font-mono text-slate-400">
                          Rover:{' '}
                          {activeDotLog.madeItHome
                            ? 'Returned safe to base'
                            : 'Stranded at sunset'}
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
        <div className="border-t border-white/[0.08] px-5 py-4 bg-slate-950/90 flex-shrink-0 flex flex-col gap-2">
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full min-h-[50px] py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-base tracking-wide active:scale-[0.99]"
            >
              Next →
            </button>
          ) : (
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => {
                  sfx('toggle', { volume: 0.5 })
                  returnToMenu()
                }}
                className="min-h-[40px] px-3 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] font-medium cursor-pointer flex items-center transition-colors"
              >
                ← Return to Menu
              </button>
              <button
                type="button"
                onClick={() => setShowDataSourcesModal(true)}
                className="min-h-[40px] px-3 rounded-xl text-xs text-sky-300 hover:text-white hover:bg-white/[0.05] font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <DatabaseScienceIcon size={14} className="text-sky-400" />
                <span>Data sources</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
