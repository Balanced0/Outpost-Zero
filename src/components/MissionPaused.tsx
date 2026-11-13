import { useGameStore } from '../store/gameStore'

export default function MissionPaused() {
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const resetMission = useGameStore((s) => s.resetMission)

  if (!isAirDepleted && !isCrewDepleted) {
    return null
  }

  const isRadiation = isCrewDepleted

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto select-none animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-md w-full p-8 text-white shadow-2xl flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-4xl">
          {isRadiation ? '☀️' : '🫁'}
        </div>

        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Outpost Zero
          </span>
          <h1 className="text-3xl font-extrabold mt-1 text-white">
            Mission paused
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            {isRadiation
              ? 'The crew got too much radiation. Real mission planners always check space weather and keep strong shielding ready.'
              : 'The astronauts ran low on air. Real mission planners always keep extra air in reserve.'}
          </p>
        </div>

        <button
          onClick={resetMission}
          className="w-full py-3.5 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-900/50 text-base"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
