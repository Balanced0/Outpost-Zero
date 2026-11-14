import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { resetSeenHints } from '../hooks/useAutoGlossaryCards'
import { sfx } from '../utils/sound'
import {
  BASE_ROVER_CAPACITY,
  ROVER_CAPACITY_PER_POINT,
  AIR_DAILY_DROP,
  AIR_REFILL_MULTIPLIER,
  ROVER_STORM_PENALTY,
} from '../config/balance'
import { DIFFICULTIES } from '../config/difficulty'
import { PLANETS } from '../config/planets'
import WhyButton from './WhyButton'
import {
  AirLifeSupportIcon,
  ShieldDefenseIcon,
  RoverVehicleIcon,
  RadarDishIcon,
  SunCalmIcon,
  AlertTriangleIcon,
  ZapBoltIcon,
  RocketIcon,
} from './icons/MissionIcons'

function formatDonkiDate(dateStr: string): string {
  if (!dateStr || dateStr.startsWith('Simulated')) return dateStr
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    if (!y || !m || !d) return dateStr
    return `${d} ${months[m - 1]} ${y}`
  } catch {
    return dateStr
  }
}

export default function MorningScreen() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const day = useGameStore((s) => s.day)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)

  const planet = useGameStore((s) => s.planet)
  const difficulty = useGameStore((s) => s.difficulty)
  const powerBudget = useGameStore((s) => s.powerBudget)
  const skipTutorial = useGameStore((s) => s.skipTutorial)
  const hasMovedSliderDay1 = useGameStore((s) => s.hasMovedSliderDay1)
  const tutorialStep = useGameStore((s) => s.tutorialStep)

  const isLoadingSpaceWeather = useGameStore((s) => s.isLoadingSpaceWeather)
  const spaceWeatherSource = useGameStore((s) => s.spaceWeatherSource)
  const stormLevelToday = useGameStore((s) => s.stormLevelToday)
  const stormDateToday = useGameStore((s) => s.stormDateToday)
  const stormEventsToday = useGameStore((s) => s.stormEventsToday)
  const loadSpaceWeather = useGameStore((s) => s.loadSpaceWeather)

  const roverPenaltyNextDay = useGameStore((s) => s.roverStormPenaltyNextDay)
  const powerSplit = useGameStore((s) => s.powerSplit)
  const setPowerAlloc = useGameStore((s) => s.setPowerAlloc)
  const startDrivingDay = useGameStore((s) => s.startDrivingDay)

  const [hintsResetConfirmed, setHintsResetConfirmed] = useState(false)

  useEffect(() => {
    if (isGameStarted && isLoadingSpaceWeather) {
      loadSpaceWeather()
    }
  }, [isGameStarted, isLoadingSpaceWeather, loadSpaceWeather])

  if (!isGameStarted || dayPhase !== 'morning' || isMissionComplete || isAirDepleted || isCrewDepleted) {
    return null
  }

  // 1. Loading Skeleton / Orbital Telemetry Uplink State
  if (isLoadingSpaceWeather) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070e]/90 backdrop-blur-lg p-4 pointer-events-auto select-none">
        <div className="mission-panel rounded-[28px] max-w-sm w-full p-8 text-white flex flex-col items-center text-center gap-4 animate-modal-in border border-orange-500/35">
          <div className="relative w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-400/30 flex items-center justify-center mb-1">
            <div className="absolute inset-1.5 rounded-full border-2 border-orange-400/80 border-t-transparent animate-spin" />
            <RadarDishIcon size={24} className="text-orange-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 block mb-1">
              Deep Space Network Uplink
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Contacting NASA DONKI...
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fetching real solar flare (FLR), geomagnetic storm (GST), and energetic particle observations from NASA space weather archives.
          </p>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10 mt-1">
            <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  const totalUsed = powerSplit.air + powerSplit.shield + powerSplit.rover
  const powerLeft = Math.max(0, powerBudget - totalUsed)

  // Projected stats
  const rawCapacity = BASE_ROVER_CAPACITY + powerSplit.rover * ROVER_CAPACITY_PER_POINT
  const projectedCapacity = Math.max(
    20,
    Math.round(rawCapacity - (roverPenaltyNextDay ? ROVER_STORM_PENALTY : 0))
  )
  const projectedAirRefill = (powerSplit.air * AIR_REFILL_MULTIPLIER).toFixed(1)
  const airNetChange = (
    powerSplit.air * AIR_REFILL_MULTIPLIER -
    AIR_DAILY_DROP
  ).toFixed(1)
  const isAirPositive = Number(airNetChange) >= 0

  // NASA source badge
  const sourceBadgeConfig = {
    live: {
      label: 'Live NASA data',
      dotColor: 'bg-emerald-400',
      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
    },
    saved: {
      label: 'Saved NASA data',
      dotColor: 'bg-sky-400',
      className: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
    },
    simulated: {
      label: 'Simulated profile',
      dotColor: 'bg-purple-400',
      className: 'bg-purple-500/15 text-purple-300 border-purple-400/40',
    },
  }[spaceWeatherSource]

  // Space weather label and descriptions
  const weatherConfig = {
    none: {
      label: 'Calm',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
      cardAccent: 'border-white/[0.08]',
      description: 'The Sun is quiet today.',
      hasRadiationWord: false,
    },
    minor: {
      label: 'Minor storm',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      cardAccent: 'border-amber-500/35',
      description: 'A small burst of radiation is coming. Shield up a little.',
      hasRadiationWord: true,
    },
    strong: {
      label: 'Strong storm',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      cardAccent: 'border-rose-500/45',
      description: 'A big radiation burst is coming. The crew needs strong shields!',
      hasRadiationWord: true,
    },
  }[stormLevelToday]

  const hasSolarFlare = stormEventsToday.some((e) => e.toLowerCase().includes('solar flare'))

  // Day 1 tutorial constraint: must move a slider before driving unlocks
  const isDay1Locked = day === 1 && !skipTutorial && !hasMovedSliderDay1

  // Explorer Mode Hint
  const explorerHint =
    stormLevelToday === 'strong'
      ? 'A big radiation storm is coming today! Give lots of power to the Shield to protect the astronauts.'
      : stormLevelToday === 'minor'
      ? 'A small storm is coming. Shield up a little to keep the crew safe.'
      : roverPenaltyNextDay
      ? 'Your rover is recovering from yesterday’s storm! Put more power into the Rover to boost battery.'
      : 'The Sun is quiet today! Great day to power up your Rover and explore far for discoveries.'

  const sliders = [
    {
      key: 'air' as const,
      label: 'Air machine',
      icon: <AirLifeSupportIcon size={17} className="text-cyan-300" />,
      iconBox: 'bg-cyan-500/15 border-cyan-400/35',
      value: powerSplit.air,
      description: 'Keeps the astronauts breathing.',
      whyTerm: null,
      sliderColor: '#22d3ee',
      fillGradient: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)',
      statLabel: `Refill: +${projectedAirRefill}% (${isAirPositive ? '+' : ''}${airNetChange}% net / day)`,
      statColor: isAirPositive
        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/25'
        : 'text-amber-300 bg-amber-500/10 border-amber-400/25',
    },
    {
      key: 'shield' as const,
      label: 'Shield',
      icon: <ShieldDefenseIcon size={17} className="text-purple-300" />,
      iconBox: 'bg-purple-500/15 border-purple-400/35',
      value: powerSplit.shield,
      description: 'Protects the base from radiation.',
      whyTerm: 'shield' as const,
      sliderColor: '#c084fc',
      fillGradient: 'linear-gradient(90deg, #7e22ce 0%, #c084fc 100%)',
      statLabel: `Defense strength: ${powerSplit.shield}%`,
      statColor: 'text-purple-300 bg-purple-500/10 border-purple-400/25',
    },
    {
      key: 'rover' as const,
      label: 'Rover',
      icon: <RoverVehicleIcon size={17} className="text-orange-300" />,
      iconBox: 'bg-orange-500/15 border-orange-400/35',
      value: powerSplit.rover,
      description: 'More power means a bigger battery for exploring.',
      whyTerm: 'rover battery' as const,
      sliderColor: '#fb923c',
      fillGradient: 'linear-gradient(90deg, #ea580c 0%, #fbbf24 100%)',
      statLabel: `Battery capacity: ${projectedCapacity} units${
        roverPenaltyNextDay ? ' (-30 storm penalty)' : ''
      }`,
      statColor: roverPenaltyNextDay
        ? 'text-rose-300 bg-rose-500/10 border-rose-400/30'
        : 'text-amber-300 bg-amber-500/10 border-amber-400/25',
    },
  ]

  const airPct = Math.max(0, Math.min(100, (powerSplit.air / powerBudget) * 100))
  const shieldPct = Math.max(0, Math.min(100, (powerSplit.shield / powerBudget) * 100))
  const roverPct = Math.max(0, Math.min(100, (powerSplit.rover / powerBudget) * 100))

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none animate-fade-in overflow-y-auto bg-[#04060d]/82 backdrop-blur-md"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="mission-panel rounded-[28px] max-w-lg w-full p-4 sm:p-6 text-white flex flex-col gap-3.5 my-auto max-h-[92dvh] overflow-y-auto relative">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500/75 to-transparent"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-orange-400 uppercase">
                Outpost Zero · {PLANETS[planet].name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${DIFFICULTIES[difficulty].badgeColor}`}
              >
                {DIFFICULTIES[difficulty].name}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-tight">
              Day {day}: Plan your power
            </h1>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              powerLeft > 0
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 animate-pulse'
                : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
            }`}
          >
            <ZapBoltIcon size={13} />
            <span>{powerLeft > 0 ? `Left: ${powerLeft}` : `${powerBudget}/${powerBudget}`}</span>
          </div>
        </div>

        {/* Explorer Hint (Stage 7A) */}
        {difficulty === 'explorer' && (
          <div className="bg-emerald-950/55 border border-emerald-400/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-100 animate-fade-in">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-sm flex-shrink-0">
              💡
            </span>
            <div className="leading-snug">
              <span className="font-mono font-bold text-emerald-300 block text-[10px] uppercase tracking-wider">
                Explorer Mission Advisory
              </span>
              <p className="mt-0.5 text-slate-200">{explorerHint}</p>
            </div>
          </div>
        )}

        {/* Space Weather Report Card */}
        <div
          className={`bg-slate-950/60 rounded-2xl p-3.5 border transition-all flex flex-col gap-2 relative ${
            tutorialStep === 'day3_storm'
              ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.25)]'
              : weatherConfig.cardAccent
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <RadarDishIcon size={14} className="text-sky-400" />
                <span>Space weather today</span>
              </span>
              {/* NASA Source Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${sourceBadgeConfig.className}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sourceBadgeConfig.dotColor}`} />
                {sourceBadgeConfig.label}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${weatherConfig.badgeColor}`}
            >
              {stormLevelToday === 'none' ? (
                <SunCalmIcon size={13} />
              ) : (
                <AlertTriangleIcon size={13} />
              )}
              <span>{weatherConfig.label}</span>
            </span>
          </div>

          {/* Replay Real Date Label */}
          <div className="text-[11px] font-mono text-orange-300/90">
            {spaceWeatherSource === 'simulated'
              ? 'Replaying simulated space weather profile'
              : `Replaying real space weather from ${formatDonkiDate(stormDateToday)}`}
          </div>

          {/* Forecast Description */}
          <div className="text-xs text-slate-200 flex items-center flex-wrap gap-1 leading-relaxed">
            {weatherConfig.hasRadiationWord ? (
              <>
                <span>
                  {stormLevelToday === 'minor' ? 'A small burst of' : 'A big'}
                </span>
                <span className="text-amber-300 font-semibold underline decoration-dotted underline-offset-2">
                  radiation
                </span>
                <WhyButton term="radiation" />
                <span>
                  {stormLevelToday === 'minor'
                    ? 'is coming. Shield up a little.'
                    : 'burst is coming. The crew needs strong shields!'}
                </span>
              </>
            ) : (
              <span>{weatherConfig.description}</span>
            )}
          </div>

          {/* Real Events List from NASA */}
          <div className="mt-0.5 bg-slate-900/75 rounded-xl p-2.5 border border-white/[0.06] flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono font-semibold text-[10px] uppercase tracking-wider">
                Recorded NASA Observations
              </span>
              {hasSolarFlare && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-sky-300 font-medium">Solar flare?</span>
                  <WhyButton term="solar flare" />
                </div>
              )}
            </div>
            <div className="text-slate-200 flex flex-wrap gap-1.5">
              {stormEventsToday.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-white/10 font-mono text-[11px] text-slate-200"
                >
                  <ZapBoltIcon size={11} className="text-amber-400" />
                  <span>{ev}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stacked Power Distribution Bar */}
        <div className="flex flex-col gap-1.5 px-0.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Power Allocation Split</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Air {powerSplit.air}
              </span>
              <span className="inline-flex items-center gap-1 text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Shield {powerSplit.shield}
              </span>
              <span className="inline-flex items-center gap-1 text-orange-300">
                <span className="w-2 h-2 rounded-full bg-orange-400" /> Rover {powerSplit.rover}
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex border border-white/10 p-[1px] gap-[2px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-l-full transition-all duration-200"
              style={{ width: `${airPct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-200"
              style={{ width: `${shieldPct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-r-full transition-all duration-200"
              style={{ width: `${roverPct}%` }}
            />
          </div>
        </div>

        {/* Sliders Container (Highlighted in Day 1 Tutorial) */}
        <div
          className={`flex flex-col gap-2.5 rounded-2xl transition-all ${
            tutorialStep === 'day1_sliders' || isDay1Locked
              ? 'ring-2 ring-cyan-400/60 p-2 bg-cyan-950/20'
              : ''
          }`}
        >
          {sliders.map((s) => {
            const fillPct = Math.max(0, Math.min(100, (s.value / powerBudget) * 100))
            return (
              <div
                key={s.key}
                className="bg-slate-950/55 rounded-2xl p-3 border border-white/[0.08] hover:border-white/[0.14] transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.iconBox}`}
                    >
                      {s.icon}
                    </div>
                    <span className="font-display font-bold text-sm text-white">{s.label}</span>
                    {s.whyTerm && <WhyButton term={s.whyTerm} />}
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-0.5 bg-slate-900/95 border border-white/10 rounded-xl p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        sfx('tick_soft', { volume: 0.5 })
                        setPowerAlloc(s.key, s.value - 1)
                      }}
                      disabled={s.value <= 0}
                      aria-label={`Decrease ${s.label}`}
                      className="w-10 h-9 min-w-[40px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 cursor-pointer font-mono font-bold text-base active:scale-95 transition-all"
                    >
                      −
                    </button>
                    <span className="font-mono font-bold text-sm text-white w-8 text-center">
                      {s.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sfx('tick_soft', { volume: 0.5 })
                        setPowerAlloc(s.key, s.value + 1)
                      }}
                      disabled={s.value >= powerBudget}
                      aria-label={`Increase ${s.label}`}
                      className="w-10 h-9 min-w-[40px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 cursor-pointer font-mono font-bold text-base active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Custom Styled Range Slider with Dynamic Progress Track */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={powerBudget}
                    value={s.value}
                    onChange={(e) => {
                      sfx('tick_soft', { volume: 0.35 })
                      setPowerAlloc(s.key, Number(e.target.value))
                    }}
                    style={{
                      color: s.sliderColor,
                      background: `linear-gradient(to right, ${s.sliderColor} 0%, ${s.sliderColor} ${fillPct}%, rgba(30, 41, 59, 0.85) ${fillPct}%, rgba(30, 41, 59, 0.85) 100%)`,
                      borderRadius: '9999px',
                      height: '8px',
                    }}
                    className="w-full tactical-slider"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] pt-0.5">
                  <p className="text-slate-400 leading-snug">{s.description}</p>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border flex-shrink-0 self-start sm:self-auto ${s.statColor}`}
                  >
                    {s.statLabel}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky Start Driving Button & Hints Reset */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-3 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-white/[0.08] flex flex-col items-center gap-1.5 mt-auto">
          <button
            onClick={startDrivingDay}
            disabled={isDay1Locked}
            className={`group relative overflow-hidden w-full min-h-[50px] py-3.5 px-4 font-display font-bold rounded-2xl transition-all duration-200 text-center text-base tracking-wide flex items-center justify-center gap-2.5 active:scale-[0.99] ${
              isDay1Locked
                ? 'bg-slate-800/90 text-slate-400 border border-white/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 text-white border border-orange-300/50 cursor-pointer shadow-[0_10px_28px_-6px_rgba(249,115,22,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]'
            }`}
          >
            {!isDay1Locked && (
              <div
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none"
                aria-hidden="true"
              />
            )}
            <RocketIcon
              size={19}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative z-10"
            />
            <span className="relative z-10">
              {isDay1Locked ? 'Move a slider to unlock Start driving' : 'Start driving'}
            </span>
          </button>

          {isDay1Locked && (
            <span className="text-[11px] text-cyan-300 font-medium animate-pulse text-center">
              Tip: Adjust any power slider above or tap + / − to unlock surface deployment
            </span>
          )}

          {/* Show hints again */}
          <button
            type="button"
            onClick={() => {
              sfx('click_soft', { volume: 0.5 })
              resetSeenHints()
              setHintsResetConfirmed(true)
              setTimeout(() => setHintsResetConfirmed(false), 3500)
            }}
            className="min-h-[38px] px-3 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            {hintsResetConfirmed ? (
              <span className="text-emerald-400 font-medium">
                ✓ Hints reset — all &ldquo;?&rdquo; cards will show again this mission
              </span>
            ) : (
              <span className="underline underline-offset-2">Show hints again</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
