import { useGameStore } from '../store/gameStore'
import { sfx } from '../utils/sound'

export default function DiscoveryPopup() {
  const activeDiscovery = useGameStore((s) => s.activeDiscovery)
  const closeDiscoveryPopup = useGameStore((s) => s.closeDiscoveryPopup)

  if (!activeDiscovery) {
    return null
  }

  const { spot, photo } = activeDiscovery

  const typeConfig = {
    rock: {
      name: 'Rock Sample',
      icon: '🪨',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    },
    riverbed: {
      name: 'Ancient Riverbed',
      icon: '🌊',
      color: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/20 border-yellow-400/40 text-yellow-300',
    },
    ice: {
      name: 'Subsurface Ice Deposit',
      icon: '❄️',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300',
    },
  }[spot.type]

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto select-none animate-fade-in overflow-y-auto">
      <div className="bg-slate-900/95 border-2 border-orange-500/60 rounded-3xl max-w-lg w-full p-5 md:p-6 text-white shadow-2xl flex flex-col gap-3.5 my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeConfig.icon}</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                Discovery Collected
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-white leading-tight">
                {typeConfig.name}
              </h2>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full border text-xs font-bold font-mono ${typeConfig.badgeBg}`}
          >
            +{spot.points} {spot.points === 1 ? 'Point' : 'Points'}!
          </div>
        </div>

        {/* Visual Content: Photo or Drawn Ice Illustration */}
        {photo ? (
          <div className="bg-black/80 rounded-2xl p-2.5 border border-slate-800 flex flex-col gap-2">
            {/* Real NASA Photo */}
            <div className="relative w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center min-h-[180px] max-h-[260px]">
              <img
                src={`/assets/nasa/${photo.file}`}
                alt={photo.title}
                className="max-h-[260px] w-full object-contain rounded-xl"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold tracking-wide shadow-md border border-blue-400/40">
                Real photo from NASA
              </span>
            </div>

            {/* Title & Photo Credit */}
            <div className="px-1">
              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {photo.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Photo: {photo.credit}
              </p>

              {/* Required Honesty Disclaimers */}
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-snug space-y-0.5 italic">
                <p>
                  This is not exactly where your rover is. It is a real picture from a Mars rover.
                </p>
                <p>
                  Colors may be adjusted by NASA scientists.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Drawn Ice Illustration Fallback (NO photo credit and NO "Real photo" label) */
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-cyan-500/40 flex flex-col items-center text-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-950/50 relative overflow-hidden">
              {/* Decorative frost glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-400/20" />
              <svg
                viewBox="0 0 100 100"
                className="w-16 h-16 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* 6-point snowflake/ice crystal */}
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="15" y1="30" x2="85" y2="70" />
                <line x1="15" y1="70" x2="85" y2="30" />
                {/* Branches */}
                <line x1="50" y1="25" x2="40" y2="20" />
                <line x1="50" y1="25" x2="60" y2="20" />
                <line x1="50" y1="75" x2="40" y2="80" />
                <line x1="50" y1="75" x2="60" y2="80" />
                <line x1="28" y1="37" x2="25" y2="25" />
                <line x1="28" y1="37" x2="38" y2="32" />
                <line x1="72" y1="63" x2="75" y2="75" />
                <line x1="72" y1="63" x2="62" y2="68" />
                <line x1="28" y1="63" x2="25" y2="75" />
                <line x1="28" y1="63" x2="38" y2="68" />
                <line x1="72" y1="37" x2="75" y2="25" />
                <line x1="72" y1="37" x2="62" y2="32" />
                {/* Center crystal */}
                <polygon
                  points="50,42 57,50 50,58 43,50"
                  fill="rgba(165,243,252,0.6)"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="max-w-xs">
              <h3 className="text-base font-bold text-cyan-200">
                Glacial Ice Sheet Detected
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Subsurface ground radar confirmed ancient frozen water ice beneath the red dust. Ice deposits like this are vital for future human expeditions to manufacture rocket propellant and breathable oxygen!
              </p>
            </div>
          </div>
        )}

        {/* Close / Resume Button */}
        <button
          onClick={() => {
            sfx('click_soft', { volume: 0.6 })
            closeDiscoveryPopup()
          }}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-orange-900/40 text-center text-sm tracking-wide mt-1"
        >
          Resume mission
        </button>
      </div>
    </div>
  )
}

