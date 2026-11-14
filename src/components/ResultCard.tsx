import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import WhyButton from './WhyButton'
import { sfx } from '../utils/sound'
import { DIFFICULTIES } from '../config/difficulty'

// ── helpers ────────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1" aria-label={`Step ${current} of ${total}`}>
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

function HealthBar({
  value,
  label,
  icon,
  diff,
}: {
  value: number
  label: string
  icon: string
  diff: number
}) {
  const color =
    value >= 60 ? 'bg-emerald-500' : value >= 30 ? 'bg-amber-500' : 'bg-red-500'
  const textColor =
    value >= 60 ? 'text-emerald-400' : value >= 30 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-2">
          {diff !== 0 && (
            <span className={`text-xs font-mono ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {diff > 0 ? `↑ +${diff}` : `↓ ${diff}`}
            </span>
          )}
          <span className={`font-mono font-bold text-base ${textColor}`}>{Math.round(value)}%</span>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

function crewFace(crewDamage: number) {
  if (crewDamage === 0) return { emoji: '😊', label: 'Crew is fine', color: 'text-emerald-400' }
  if (crewDamage <= 10) return { emoji: '😐', label: 'Small bump', color: 'text-amber-400' }
  return { emoji: '😟', label: 'Crew was hurt', color: 'text-red-400' }
}

// ── main component ─────────────────────────────────────────────────────────

export default function ResultCard() {
  const dayEndResult = useGameStore((s) => s.dayEndResult)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const startNextDay = useGameStore((s) => s.startNextDay)
  const discoverySpots = useGameStore((s) => s.discoverySpots)
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

  // ── slide/fade wrapper ──
  const cardBase =
    'flex flex-col flex-1 min-h-0 gap-5 items-center justify-center text-center px-2 animate-fade-in'

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto select-none bg-black/85 backdrop-blur-sm"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="bg-slate-900/97 border-2 border-orange-500/50 rounded-3xl max-w-sm w-full mx-3 shadow-2xl flex flex-col overflow-hidden"
           style={{ maxHeight: '90dvh' }}>

        {/* Top bar: label + step dots */}
        <div className="px-5 pt-4 pb-2 flex flex-col items-center gap-1 border-b border-slate-800">
          <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase">
            Day {day} complete
          </span>
          <StepDots current={step} total={3} />
        </div>

        {/* Step content — scrollable if needed */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* ── STEP 1: How did the day go? ── */}
          {step === 1 && (
            <div className={cardBase}>
              <div className="text-6xl">{madeItHome ? '🏠' : '🌙'}</div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {madeItHome ? 'You made it home!' : 'Stranded overnight'}
                </h2>
                <p className="text-base text-slate-300 mt-2 leading-relaxed max-w-[260px] mx-auto">
                  {madeItHome
                    ? 'The rover is charged and ready for tomorrow.'
                    : 'Sunset caught the rover outside. It was towed home with half a battery.'}
                </p>
              </div>

              {/* Subtle source badge */}
              <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                spaceWeatherSource === 'live'
                  ? 'bg-sky-900/50 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 border-slate-600/40 text-slate-400'
              }`}>
                {spaceWeatherSource === 'live' ? '📡 Live NASA data' : '💾 Saved NASA data'}
              </span>
            </div>
          )}

          {/* ── STEP 2: What happened today? ── */}
          {step === 2 && (
            <div className={cardBase}>
              <div className="text-6xl">{isStorm ? (stormLevel === 'strong' ? '🌩️' : '⚡') : '☀️'}</div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {isStorm ? 'Space storm today' : 'A quiet day'}
                </h2>
                <p className="text-base text-slate-300 mt-2 leading-relaxed max-w-[280px] mx-auto">
                  {isStorm
                    ? (crewDamage > 10
                        ? `A ${stormLevel} storm hit today. The crew got hurt a little.`
                        : `A ${stormLevel} storm hit today. Your shield blocked most of it.`)
                    : 'The Sun was calm. A good day for exploring.'}
                </p>
              </div>

              {/* Crew face */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">{face.emoji}</span>
                <span className={`text-sm font-semibold ${face.color}`}>{face.label}</span>
              </div>

              {/* Rover exposed extra line */}
              {roverSheltered === false && (
                <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-sm text-amber-200 max-w-[280px]">
                  ⚠️ The rover was caught outside in the storm. Tomorrow starts with less battery.
                </div>
              )}

              {/* NASA source badge */}
              <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                spaceWeatherSource === 'live'
                  ? 'bg-sky-900/50 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 border-slate-600/40 text-slate-400'
              }`}>
                {spaceWeatherSource === 'live' ? '📡 Live NASA data' : '💾 Saved NASA data'}
              </span>
            </div>
          )}

          {/* ── STEP 3: Base and finds ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5 w-full">
              {/* Section header */}
              <div className="text-center">
                <div className="text-4xl mb-1">🏕️</div>
                <h2 className="text-xl font-black text-white">Your base &amp; your finds</h2>
              </div>

              {/* Two big bars */}
              <div className="flex flex-col gap-4 w-full">
                <HealthBar icon="🫁" label="Air" value={airAfter} diff={airDiff} />
                <HealthBar icon="👩‍🚀" label="Crew health" value={crewHealthAfter} diff={crewDiff} />
              </div>

              {/* Discoveries */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-1 text-center">
                {pointsToday > 0 ? (
                  <>
                    <div className="text-3xl font-black text-amber-300">+{pointsToday} points 💎</div>
                    <div className="text-sm text-slate-400">
                      {discoveriesToday} {discoveriesToday === 1 ? 'discovery' : 'discoveries'} today
                    </div>
                  </>
                ) : (
                  <div className="text-base text-slate-400 font-medium">No discoveries today — keep exploring! 🗺️</div>
                )}
                <div className="text-sm text-slate-300 font-semibold mt-1">
                  Total: {totalPoints} of {diffConfig.discoveryGoal} pts
                  {totalPoints >= diffConfig.discoveryGoal && (
                    <span className="ml-1 text-amber-400">🎉 Goal reached!</span>
                  )}
                </div>
              </div>

              {/* Did you know */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5">
                <div className="text-xs font-bold text-sky-400 mb-1">🚀 Did you know?</div>
                <p className="text-sm leading-relaxed text-slate-300">{fact}</p>
              </div>

              {/* See details toggle */}
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer self-center py-1 min-h-[36px]"
              >
                {detailsOpen ? 'Hide details ▲' : 'See details ▼'}
              </button>

              {/* Collapsed details */}
              {detailsOpen && (
                <div className="flex flex-col gap-3 text-xs animate-fade-in">
                  {/* NASA DONKI citation */}
                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-2.5 text-amber-300 font-medium leading-snug">
                    Real event today: {eventsDescription} (NASA DONKI, {stormDate})
                  </div>

                  {/* Why sentence */}
                  <p className="text-slate-300 leading-relaxed bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                    {whySentence}
                  </p>

                  {/* Power split & shield */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                      <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1 mb-1">
                        ⚡ Power Split <WhyButton term="shield" />
                      </div>
                      <div className="font-mono font-bold text-slate-200 flex flex-col gap-0.5">
                        <span className="text-cyan-400">Air {powerSplit.air}</span>
                        <span className="text-purple-400">Shield {powerSplit.shield}</span>
                        <span className="text-orange-400">Rover {powerSplit.rover}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Shield {shieldStrength}% defense</div>
                    </div>

                    <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                      <div className="text-slate-400 text-[10px] font-medium mb-1">🛡️ Storm</div>
                      <div className="font-bold text-slate-200">
                        {stormLevel === 'none' ? 'None' : stormLevel.charAt(0).toUpperCase() + stormLevel.slice(1)}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1">
                        Crew: {crewHealthBefore}% → {crewHealthAfter}%
                        {crewDamage > 0 ? ` (−${crewDamage}%)` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Exploration stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                      <div className="text-slate-400 text-[10px]">🚗 Distance</div>
                      <div className="font-mono font-bold text-slate-100 mt-0.5">{distanceDriven} m</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        🔋 Battery left <WhyButton term="rover battery" />
                      </div>
                      <div className="font-mono font-bold text-slate-100 mt-0.5">{batteryLeft} / {batteryCapacity}</div>
                    </div>
                  </div>

                  {/* Air */}
                  <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                    <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-1">
                      🫁 Air machine <WhyButton term="air machine" />
                    </div>
                    <div className="font-mono font-bold text-slate-100">
                      {airBefore}% → {airAfter}%
                      <span className="text-slate-400 font-normal ml-1 text-[10px]">
                        {airDiff > 0 ? `+${airDiff}% restored` : airDiff === 0 ? 'Balanced' : `${airDiff}% net loss`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-slate-800 px-5 py-4 bg-slate-900/95 flex-shrink-0">
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full min-h-[52px] py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-lg tracking-wide active:scale-[0.99]"
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
              className="w-full min-h-[52px] py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-lg tracking-wide active:scale-[0.99]"
            >
              {day >= 20 ? 'View Mission Report 🚀' : `Start Day ${nextDayNumber} 🚀`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
