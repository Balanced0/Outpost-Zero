import { useGameStore } from '../store/gameStore'

export default function ResultCard() {
  const dayEndResult = useGameStore((s) => s.dayEndResult)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const startNextDay = useGameStore((s) => s.startNextDay)

  if (!dayEndResult || isMissionComplete || isAirDepleted) {
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
    fact,
  } = dayEndResult

  const nextDayNumber = day + 1
  const airDiff = airAfter - airBefore

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pointer-events-auto animate-fade-in select-none">
      <div className="bg-slate-900/95 border-2 border-orange-500/50 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* Title */}
        <div className="text-center">
          <span className="text-[11px] font-semibold tracking-wider text-orange-400 uppercase">
            Outpost Zero Mission Log
          </span>
          <h2 className="text-2xl font-bold mt-0.5">Day {day} complete</h2>
        </div>

        {/* Status Badge */}
        <div
          className={`rounded-2xl p-3.5 border flex items-center gap-3 ${
            madeItHome
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="text-3xl flex-shrink-0">
            {madeItHome ? '🏠' : '⛺'}
          </div>
          <div>
            <div className="font-bold text-sm">
              {madeItHome ? 'Made it home safe' : 'Stranded overnight'}
            </div>
            <div className="text-xs opacity-90 mt-0.5 leading-snug">
              {madeItHome
                ? 'Parked safely at base! Tomorrow begins with a full battery.'
                : 'Sunset caught the rover outside! Towed home with 50% battery.'}
            </div>
          </div>
        </div>

        {/* Stage 3 Stats: Air & Power Split */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Air before and after */}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>🫁</span>
              <span>Air Machine</span>
            </div>
            <div className="text-base font-bold font-mono mt-1 text-slate-100 flex items-center gap-1.5">
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

          {/* Today's Power Split */}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>⚡</span>
              <span>Power Split</span>
            </div>
            <div className="text-xs font-mono font-bold mt-1 text-slate-200 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-cyan-400">Air:</span>
                <span>{powerSplit.air}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Shield:</span>
                <span>{powerSplit.shield}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-400">Rover:</span>
                <span>{powerSplit.rover}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exploration Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>🚗</span> Distance Driven
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-slate-100">
              {distanceDriven} m
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/80">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>🔋</span> Battery Left
            </div>
            <div className="text-lg font-bold font-mono mt-1 text-slate-100">
              {batteryLeft} / {batteryCapacity}
            </div>
          </div>
        </div>

        {/* NASA Fact Box */}
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-1">
            <span>🚀</span>
            <span>Did you know?</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            {fact}
          </p>
        </div>

        {/* Next Day Button */}
        <button
          onClick={startNextDay}
          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-center text-sm tracking-wide"
        >
          Start Day {nextDayNumber}
        </button>
      </div>
    </div>
  )
}
