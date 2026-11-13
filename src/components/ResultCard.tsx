import { useGameStore } from '../store/gameStore'
import WhyButton from './WhyButton'
import { sfx } from '../utils/sound'

export default function ResultCard() {
  const dayEndResult = useGameStore((s) => s.dayEndResult)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const startNextDay = useGameStore((s) => s.startNextDay)

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
  const airDiff = airAfter - airBefore

  const eventsDescription =
    stormEvents && stormEvents.length > 0 && !stormEvents[0].toLowerCase().includes('quiet')
      ? stormEvents.join(', ')
      : 'quiet day'

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pointer-events-auto animate-fade-in select-none overflow-y-auto">
      <div className="bg-slate-900/95 border-2 border-orange-500/50 rounded-3xl max-w-md w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-3 my-auto">
        {/* Title */}
        <div className="text-center">
          <span className="text-[11px] font-semibold tracking-wider text-orange-400 uppercase">
            Outpost Zero Mission Log
          </span>
          <h2 className="text-2xl font-bold mt-0.5">Day {day} complete</h2>
        </div>

        {/* Status Badge: Home safe vs Stranded */}
        <div
          className={`rounded-2xl p-2.5 border flex items-center gap-3 ${
            madeItHome
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="text-2xl flex-shrink-0">
            {madeItHome ? '🏠' : '⛺'}
          </div>
          <div>
            <div className="font-bold text-xs">
              {madeItHome ? 'Made it home safe' : 'Stranded overnight'}
            </div>
            <div className="text-[11px] opacity-90 leading-snug">
              {madeItHome
                ? 'Parked safely at base! Tomorrow begins with a full battery.'
                : 'Sunset caught the rover outside! Towed home with 50% battery.'}
            </div>
          </div>
        </div>

        {/* Space Weather & Storm Report (Stage 4 & 5) */}
        <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-slate-300">
              <span>📡</span>
              <span>Space Weather & Storm Result</span>
              <WhyButton term="radiation" />
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                stormLevel === 'none'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : stormLevel === 'minor'
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40'
                  : 'bg-red-500/20 text-red-300 border-red-400/40'
              }`}
            >
              {stormLevel === 'none'
                ? 'Calm (No Storm)'
                : stormLevel === 'minor'
                ? 'Minor Storm'
                : 'Strong Storm'}
            </span>
          </div>

          {/* NASA DONKI Real Event Citation (Stage 5) */}
          <div className="text-[11px] text-amber-300 bg-slate-900/80 rounded-xl px-2.5 py-1.5 border border-slate-700/60 leading-snug font-medium">
            Real event today: {eventsDescription} (NASA DONKI, {stormDate})
          </div>

          {/* Plain "Why" sentence */}
          <p className="text-xs text-slate-200 bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/50 leading-relaxed">
            {whySentence}
          </p>

          {/* Crew Health & Rover Exposure Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">Crew Health</span>
              <span className="font-mono font-bold text-slate-100">
                {crewHealthBefore}% → {crewHealthAfter}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {crewDamage > 0 ? `-${crewDamage}% damage` : stormLevel === 'none' ? '+5% healed' : '0% damage'}
              </span>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px]">Rover Storm Status</span>
              {roverSheltered === null ? (
                <span className="text-slate-300 font-medium">No storm today</span>
              ) : roverSheltered ? (
                <span className="text-emerald-400 font-bold">Safe at base 🛡️</span>
              ) : (
                <span className="text-red-400 font-bold">Caught exposed ⚠️</span>
              )}
              {roverSheltered === false && (
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  -30 battery tomorrow
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Discoveries Section (Stage 6) */}
        <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💎</span>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-200">Discoveries</span>
                <WhyButton term="scan" />
              </div>
              <span className="text-[10px] text-slate-400">
                Found today: {discoveriesToday}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-amber-300 text-sm">
              +{pointsToday} pts
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Total: {totalPoints} pts
            </div>
          </div>
        </div>

        {/* Air & Power Split */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>🫁</span>
              <span>Air Machine</span>
            </div>
            <div className="text-sm font-bold font-mono mt-0.5 text-slate-100 flex items-center gap-1">
              <span>{airBefore}%</span>
              <span className="text-slate-500">→</span>
              <span className={airAfter > 50 ? 'text-cyan-400' : 'text-amber-400'}>
                {airAfter}%
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {airDiff > 0 ? `+${airDiff}% restored` : airDiff === 0 ? 'Balanced' : `${airDiff}% net loss`}
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2.5 border border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>⚡</span>
              <span>Power Split</span>
              <WhyButton term="shield" />
            </div>
            <div className="text-[11px] font-mono font-bold mt-0.5 text-slate-200 flex justify-between gap-1">
              <span className="text-cyan-400">Air {powerSplit.air}</span>
              <span className="text-purple-400">Shd {powerSplit.shield}</span>
              <span className="text-orange-400">Rov {powerSplit.rover}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Shield {shieldStrength}% defense
            </div>
          </div>
        </div>

        {/* Exploration Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/80 rounded-2xl p-2 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block">🚗 Distance Driven</span>
            <span className="text-sm font-bold font-mono text-slate-100">
              {distanceDriven} m
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-2 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 block">🔋 Battery Left</span>
              <WhyButton term="rover battery" />
            </div>
            <span className="text-sm font-bold font-mono text-slate-100">
              {batteryLeft} / {batteryCapacity}
            </span>
          </div>
        </div>

        {/* NASA Fact Box */}
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-2.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 mb-0.5">
            <span>🚀</span>
            <span>Did you know?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {fact}
          </p>
        </div>

        {/* Next Day or Mission Debrief Button */}
        <button
          onClick={() => {
            sfx('confirm', { volume: 0.6 })
            startNextDay()
          }}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-center text-sm tracking-wide"
        >
          {day >= 20 ? 'View Mission Debrief 🚀' : `Start Day ${nextDayNumber}`}
        </button>
      </div>
    </div>
  )
}
