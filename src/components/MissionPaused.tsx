import { useGameStore } from '../store/gameStore'
import { SunCalmIcon, AirLifeSupportIcon } from './icons/MissionIcons'

export default function MissionPaused() {
  const isAirDepleted = useGameStore((s) => s.isAirDepleted)
  const isCrewDepleted = useGameStore((s) => s.isCrewDepleted)
  const resetMission = useGameStore((s) => s.resetMission)

  if (!isAirDepleted && !isCrewDepleted) {
    return null
  }

  const isRadiation = isCrewDepleted

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#04060d]/85 backdrop-blur-md p-4 pointer-events-auto select-none animate-fade-in">
      <div className="mission-panel border border-amber-500/50 rounded-[28px] max-w-md w-full p-8 text-white flex flex-col items-center text-center gap-5 animate-modal-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
          {isRadiation ? <SunCalmIcon size={32} /> : <AirLifeSupportIcon size={32} />}
        </div>

        <div>
          <span className="text-xs font-mono font-semibold tracking-widest text-amber-400 uppercase">
            Outpost Zero
          </span>
          <h1 className="font-display text-3xl font-bold mt-1 text-white">
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
          className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-base"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
