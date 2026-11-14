import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import WhyButton from './WhyButton'
import { sfx } from '../utils/sound'
import { DIFFICULTIES } from '../config/difficulty'
import {
  AirLifeSupportIcon,
  HeartPulseIcon,
  CrystalSampleIcon,
  RadarDishIcon,
  RocketIcon,
  HomeBaseIcon,
  SunCalmIcon,
  AlertTriangleIcon,
} from './icons/MissionIcons'

// ── helpers ────────────────────────────────────────────────────────────────

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
    <div
      className="flex items-center justify-center gap-2 py-1"
      aria-label={`Step ${current} of ${total}`}
    >
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

function HealthBar({
  value,
  label,
  icon,
  diff,
}: {
  value: number
  label: string
  icon: React.ReactNode
  diff: number
}) {
  const color =
    value >= 60
      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
      : value >= 30
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-500 to-red-400'
  const textColor =
    value >= 60 ? 'text-emerald-300' : value >= 30 ? 'text-amber-300' : 'text-rose-400'

  return (
    <div className="bg-slate-950/55 border border-white/[0.07] rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-display font-semibold text-slate-100">
          {icon}
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-2">
          {diff !== 0 && (
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                diff > 0
                  ? 'text-emerald-300 bg-emerald-500/15'
                  : 'text-rose-300 bg-rose-500/15'
              }`}
            >
              {diff > 0 ? `↑ +${diff}%` : `↓ ${diff}%`}
            </span>
          )}
          <span className={`font-mono font-bold text-base ${textColor}`}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

function crewFace(crewDamage: number) {
  if (crewDamage === 0)
    return {
      emoji: '😊',
      label: 'Crew is nominal & healthy',
      color: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
    }
  if (crewDamage <= 10)
    return {
      emoji: '😐',
      label: 'Minor radiation exposure',
      color: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
    }
  return {
    emoji: '😟',
    label: 'Crew took radiation damage',
    color: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
  }
}

// ── main component ─────────────────────────────────────────────────────────

export default function ResultCard() {
  const dayEndResult = useGameStore((s) => s.dayEndResult)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const startNextDay = useGameStore((s) => s.startNextDay)
  const difficulty = useGameStore((s) => s.difficulty)

  const isMissionControl = difficulty === 'mission_control'
  const [step, setStep] = useState(1)
  const [detailsOpen, setDetailsOpen] = useState(isMissionControl)

  // Reset step and details whenever a new dayEndResult is viewed
  const [lastDay, setLastDay] = useState<number | null>(null)
  if (dayEndResult && dayEndResult.day !== lastDay) {
    setLastDay(dayEndResult.day)
    setStep(1)
    setDetailsOpen(isMissionControl)
  }

  if (!dayEndResult || isMissionComplete || isAirDepleted || isCrewDepleted) {
    return null
  }

  const {
    day,
    madeItHome,
    distanceDriven,
    batteryLeft,
    batteryCapacity,
    airBefore,
    airAfter,
    powerSplit,
    stormLevel,
    stormDate,
    stormEvents,
    spaceWeatherSource,
    shieldStrength,
    crewHealthBefore,
    crewHealthAfter,
    crewDamage,
    roverSheltered,
    whySentence,
    fact,
    discoveriesToday,
    pointsToday,
    totalPoints,
  } = dayEndResult

  const nextDayNumber = day + 1
  const airDiff = Math.round(airAfter - airBefore)
  const crewDiff = Math.round(crewHealthAfter - crewHealthBefore)
  const diffConfig = DIFFICULTIES[difficulty]
  const isStorm = stormLevel !== 'none'

  const eventsDescription =
    stormEvents && stormEvents.length > 0 && !stormEvents[0].toLowerCase().includes('quiet')
      ? stormEvents.join(', ')
      : 'quiet day'

  const face = crewFace(crewDamage)

  function goNext() {
    sfx('click_soft', { volume: 0.5 })
    setStep((s) => s + 1)
  }

  const cardBase =
    'flex flex-col flex-1 min-h-0 gap-5 items-center justify-center text-center px-2 animate-fade-in'

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto select-none bg-[#04060d]/85 backdrop-blur-md"
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
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500/75 to-transparent"
          aria-hidden="true"
        />

        {/* Top bar: label + step dots */}
        <div className="px-5 pt-4 pb-2.5 flex flex-col items-center gap-1.5 border-b border-white/[0.08]">
          <span className="text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase">
            Sol {day} Debrief · Step {step} of 3
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

        {/* Step content — scrollable if needed */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {/* ── STEP 1: How did the day go? ── */}
          {step === 1 && (
            <div className={cardBase}>
              <div
                className={`w-20 h-20 rounded-3xl border flex items-center justify-center ${
                  madeItHome
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                }`}
              >
                {madeItHome ? <HomeBaseIcon size={38} /> : <span className="text-4xl">🌙</span>}
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {madeItHome ? 'You made it home!' : 'Stranded overnight'}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-[280px] mx-auto">
                  {madeItHome
                    ? 'The rover is safely docked in the habitat bay and fully recharged for tomorrow.'
                    : 'Sunset caught the rover outside the perimeter. It was towed home with half a battery.'}
                </p>
              </div>

              {/* Quick telemetry pills */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08]">
                  Driven: {distanceDriven}m
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 ${
                    spaceWeatherSource === 'live'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-sky-950/60 border-sky-500/40 text-sky-300'
                  }`}
                >
                  <RadarDishIcon size={12} />
                  <span>
                    {spaceWeatherSource === 'live' ? 'Live NASA data' : 'Saved NASA data'}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 2: What happened today? ── */}
          {step === 2 && (
            <div className={cardBase}>
              <div
                className={`w-20 h-20 rounded-3xl border flex items-center justify-center ${
                  isStorm
                    ? stormLevel === 'strong'
                      ? 'bg-rose-500/15 border-rose-400/40 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
                      : 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                    : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                }`}
              >
                {isStorm ? <AlertTriangleIcon size={36} /> : <SunCalmIcon size={36} />}
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {isStorm ? 'Space storm today' : 'A quiet day'}
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-[280px] mx-auto">
                  {isStorm
                    ? crewDamage > 10
                      ? `A ${stormLevel} storm hit today. The crew got hurt a little.`
                      : `A ${stormLevel} storm hit today. Your shield blocked most of it.`
                    : 'The Sun was calm. A good day for exploring.'}
                </p>
              </div>

              {/* Crew status badge */}
              <div
                className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 ${face.color}`}
              >
                <span className="text-2xl">{face.emoji}</span>
                <span className="text-xs sm:text-sm font-semibold">{face.label}</span>
              </div>

              {/* Rover exposed extra line */}
              {roverSheltered === false && (
                <div className="bg-amber-950/50 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-amber-200 max-w-[300px]">
                  ⚠️ The rover was caught outside in the storm. Tomorrow starts with less battery.
                </div>
              )}

              {/* NASA source badge */}
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold border flex items-center gap-1.5 ${
                  spaceWeatherSource === 'live'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-sky-950/60 border-sky-500/40 text-sky-300'
                }`}
              >
                <RadarDishIcon size={12} />
                <span>
                  {spaceWeatherSource === 'live' ? 'Live NASA data' : 'Saved NASA data'}
                </span>
              </span>
            </div>
          )}

          {/* ── STEP 3: Base and finds ── */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5 w-full animate-fade-in">
              {/* Section header */}
              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-white">
                  Your base &amp; your finds
                </h2>
              </div>

              {/* Two big bars */}
              <div className="flex flex-col gap-2.5 w-full">
                <HealthBar
                  icon={<AirLifeSupportIcon size={16} className="text-cyan-400" />}
                  label="Air"
                  value={airAfter}
                  diff={airDiff}
                />
                <HealthBar
                  icon={<HeartPulseIcon size={16} className="text-rose-400" />}
                  label="Crew health"
                  value={crewHealthAfter}
                  diff={crewDiff}
                />
              </div>

              {/* Discoveries */}
              <div className="bg-slate-950/60 border border-white/[0.08] rounded-2xl p-3.5 flex flex-col gap-1 text-center">
                {pointsToday > 0 ? (
                  <>
                    <div className="font-display text-2xl font-bold text-amber-300 flex items-center justify-center gap-1.5">
                      <CrystalSampleIcon size={20} className="text-purple-300" />
                      <span>+{pointsToday} points</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {discoveriesToday} {discoveriesToday === 1 ? 'discovery' : 'discoveries'} collected today
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400 font-medium">
                    No discoveries today — keep exploring!
                  </div>
                )}
                <div className="text-xs font-mono text-slate-300 font-semibold mt-1">
                  Total: {totalPoints} of {diffConfig.discoveryGoal} pts
                  {totalPoints >= diffConfig.discoveryGoal && (
                    <span className="ml-1.5 text-emerald-400">✓ Goal reached!</span>
                  )}
                </div>
              </div>

              {/* Did you know */}
              <div className="bg-sky-950/35 border border-sky-400/25 rounded-2xl p-3.5">
                <div className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <RocketIcon size={13} className="text-sky-400" />
                  <span>Did you know?</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">{fact}</p>
              </div>

              {/* See details toggle */}
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer self-center py-1 min-h-[36px]"
              >
                {detailsOpen ? 'Hide telemetry details ▲' : 'See telemetry details ▼'}
              </button>

              {/* Collapsed details */}
              {detailsOpen && (
                <div className="flex flex-col gap-2.5 text-xs animate-fade-in">
                  {/* NASA DONKI citation */}
                  <div className="bg-slate-950/80 border border-white/[0.07] rounded-xl px-3 py-2.5 text-amber-300 font-mono text-[11px] leading-snug">
                    Real event today: {eventsDescription} (NASA DONKI, {stormDate})
                  </div>

                  {/* Why sentence */}
                  <p className="text-slate-300 leading-relaxed bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                    {whySentence}
                  </p>

                  {/* Power split & shield */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono font-medium flex items-center gap-1 mb-1">
                        ⚡ Power Split <WhyButton term="shield" />
                      </div>
                      <div className="font-mono font-bold text-slate-200 flex flex-col gap-0.5 text-[11px]">
                        <span className="text-cyan-300">Air {powerSplit.air}</span>
                        <span className="text-purple-300">Shield {powerSplit.shield}</span>
                        <span className="text-orange-300">Rover {powerSplit.rover}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Shield {shieldStrength}% defense
                      </div>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono font-medium mb-1">
                        🛡️ Storm
                      </div>
                      <div className="font-bold text-slate-200">
                        {stormLevel === 'none'
                          ? 'None'
                          : stormLevel.charAt(0).toUpperCase() + stormLevel.slice(1)}
                      </div>
                      <div className="text-slate-400 text-[10px] font-mono mt-1">
                        Crew: {crewHealthBefore}% → {crewHealthAfter}%
                        {crewDamage > 0 ? ` (−${crewDamage}%)` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Exploration stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono">Distance</div>
                      <div className="font-mono font-bold text-slate-100 mt-0.5">
                        {distanceDriven} m
                      </div>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                      <div className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                        Battery left <WhyButton term="rover battery" />
                      </div>
                      <div className="font-mono font-bold text-slate-100 mt-0.5">
                        {batteryLeft} / {batteryCapacity}
                      </div>
                    </div>
                  </div>

                  {/* Air */}
                  <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06]">
                    <div className="text-slate-400 text-[10px] font-mono flex items-center gap-1 mb-1">
                      Air machine <WhyButton term="air machine" />
                    </div>
                    <div className="font-mono font-bold text-slate-100">
                      {airBefore}% → {airAfter}%
                      <span className="text-slate-400 font-normal ml-1.5 text-[10px]">
                        {airDiff > 0
                          ? `+${airDiff}% restored`
                          : airDiff === 0
                          ? 'Balanced'
                          : `${airDiff}% net loss`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-white/[0.08] px-5 py-4 bg-slate-950/90 flex-shrink-0">
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full min-h-[50px] py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-base tracking-wide active:scale-[0.99]"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                sfx('confirm', { volume: 0.6 })
                startNextDay()
              }}
              className="w-full min-h-[50px] py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-base tracking-wide flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>
                {day >= 20 ? 'View Mission Report' : `Start Day ${nextDayNumber}`}
              </span>
              <RocketIcon size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
