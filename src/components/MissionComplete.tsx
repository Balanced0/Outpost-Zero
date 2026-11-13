import { useGameStore } from '../store/gameStore'
import marsPhotosJson from '../data/marsPhotos.json'

interface MarsPhoto {
  file: string
  tag: string
  title: string
  credit: string
  sourceUrl: string
}

const photos = marsPhotosJson as MarsPhoto[]

export default function MissionComplete() {
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)
  const totalDiscoveryPoints = useGameStore((s) => s.totalDiscoveryPoints)
  const resetMission = useGameStore((s) => s.resetMission)

  if (!isMissionComplete) {
    return null
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto select-none overflow-y-auto">
      <div className="bg-slate-900 border-2 border-orange-500 rounded-3xl max-w-lg w-full p-6 md:p-8 text-white shadow-2xl flex flex-col items-center text-center gap-5 my-auto">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-4xl">
          🚀
        </div>

        <div>
          <span className="text-xs font-semibold tracking-wider text-orange-400 uppercase">
            Outpost Zero • 20-Day Sol Complete
          </span>
          <h1 className="text-3xl font-extrabold mt-1 text-white">
            Mission Complete!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You successfully survived all 20 Martian days exploring the surface and keeping Outpost Zero running!
          </p>
        </div>

        {/* Discovery Score Badge */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <div className="text-left">
              <span className="text-xs text-slate-400 uppercase font-semibold block">
                Scientific Discoveries
              </span>
              <span className="text-sm font-bold text-slate-200">
                Mission Score
              </span>
            </div>
          </div>
          <div className="font-mono text-2xl font-extrabold text-amber-300">
            {totalDiscoveryPoints} pts
          </div>
        </div>

        {/* Photo Credits Section (NASA Space Apps Honesty & Attribution) */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>📷</span>
              <span>NASA Photo Credits & Attribution</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Public Domain / NASA JPL
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            All Martian imagery used for rock samples and ancient terrain discoveries are real photos captured by NASA Mars rovers.
          </p>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
            {photos.map((p) => (
              <div
                key={p.file}
                className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 flex flex-col gap-0.5"
              >
                <div className="font-semibold text-slate-200 text-[11px]">
                  {p.title}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Credit: {p.credit}
                </div>
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-sky-400 hover:text-sky-300 underline font-medium inline-flex items-center gap-1 mt-0.5"
                >
                  <span>View on NASA Photojournal ↗</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetMission}
          className="w-full py-3.5 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-xl shadow-orange-900/50 text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
