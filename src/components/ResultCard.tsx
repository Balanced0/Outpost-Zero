import { useGameStore } from '../store/gameStore'

export default function ResultCard() {
  const dayEndResult = useGameStore((s) => s.dayEndResult)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const startNextDay = useGameStore((s) => s.startNextDay)

  if (!dayEndResult || isMissionComplete) {
    return null
  }

  const { day, madeItHome, distanceDriven, batteryLeft, fact } = dayEndResult
  const nextDayNumber = day + 1

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 pointer-events-auto animate-fade-in select-none">
      <div className="bg-slate-900/95 border-2 border-orange-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* Title */}
        <div className="text-center">
          <span className="text-xs font-semibold tracking-wider text-orange-400 uppercase">
            Outpost Zero Mission Log
          </span>
          <h2 className="text-2xl font-bold mt-0.5">Day {day} complete</h2>
        </div>

        {/* Status Badge */}
        <div
          className={`rounded-xl p-3.5 border flex items-center gap-3 ${
            madeItHome
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="text-3xl flex-shrink-0">
            {madeItHome ? '🏠' : '⛺'}
          </div>
          <div>
            <div className="font-bold text-base">
              {madeItHome ? 'Made it home safe' : 'Stranded overnight'}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {madeItHome
                ? 'Parked safely at base! Battery fully recharged to 100%.'
                : 'Sunset caught the rover outside! Towed home with 50% battery.'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>🚗</span> Distance Today
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-slate-100">
              {distanceDriven} m
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>🔋</span> Battery Left
            </div>
            <div className="text-xl font-bold font-mono mt-1 text-slate-100">
              {batteryLeft}%
            </div>
          </div>
        </div>

        {/* NASA Fact Box */}
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3.5">
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
          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-center text-sm tracking-wide mt-1"
        >
          Start Day {nextDayNumber}
        </button>
      </div>
    </div>
  )
}

