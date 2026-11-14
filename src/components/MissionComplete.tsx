import { useGameStore } from '../store/gameStore'
import marsPhotosJson from '../data/marsPhotos.json'
import { RocketIcon, CrystalSampleIcon } from './icons/MissionIcons'

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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#04060d]/85 backdrop-blur-md p-4 pointer-events-auto select-none overflow-y-auto animate-fade-in">
      <div className="mission-panel border border-orange-500/50 rounded-[28px] max-w-lg w-full p-6 md:p-8 text-white flex flex-col items-center text-center gap-5 my-auto animate-modal-in">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-[0_0_24px_rgba(249,115,22,0.25)]">
          <RocketIcon size={32} />
        </div>

        <div>
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-400 uppercase">
            Outpost Zero · 20-Day Sol Complete
          </span>
          <h1 className="font-display text-3xl font-bold mt-1 text-white">
            Mission Complete!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            You successfully survived all 20 Martian days exploring the surface and keeping Outpost Zero running!
          </p>
        </div>

        {/* Discovery Score Badge */}
        <div className="bg-slate-950/65 border border-white/[0.08] rounded-2xl px-5 py-3.5 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/35 flex items-center justify-center text-purple-300">
              <CrystalSampleIcon size={20} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                Scientific Discoveries
              </span>
              <span className="font-display text-sm font-bold text-slate-100">
                Mission Score
              </span>
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-300">
            {totalDiscoveryPoints} pts
          </div>
        </div>

        {/* Photo Credits Section */}
        <div className="w-full bg-slate-950/65 border border-white/[0.08] rounded-2xl p-4 text-left flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <span>📷</span>
              <span>NASA Photo Credits &amp; Attribution</span>
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
                className="bg-slate-900/80 rounded-xl p-2.5 border border-white/[0.06] flex flex-col gap-0.5"
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
                  className="text-[10px] text-sky-400 hover:text-sky-300 underline font-mono inline-flex items-center gap-1 mt-0.5"
                >
                  <span>View on NASA Photojournal ↗</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetMission}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
