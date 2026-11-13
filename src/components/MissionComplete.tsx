import { useGameStore } from '../store/gameStore'

export default function MissionComplete() {
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const resetMission = useGameStore((s) => s.resetMission)

  if (!isMissionComplete) {
    return null
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto select-none">
      <div className="bg-slate-900 border-2 border-orange-500 rounded-3xl max-w-md w-full p-8 text-white shadow-2xl flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-4xl">
          🚀
        </div>

        <div>
          <span className="text-xs font-semibold tracking-wider text-orange-400 uppercase">
            Outpost Zero
          </span>
          <h1 className="text-3xl font-extrabold mt-1 text-white">
            Mission Complete!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You successfully survived all 20 Martian days exploring the surface and keeping Outpost Zero running!
          </p>
        </div>

        <button
          onClick={resetMission}
          className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-900/50 text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

