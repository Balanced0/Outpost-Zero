import { useGameStore } from '../store/gameStore'
import { sfx } from '../utils/sound'
import { CrystalSampleIcon, ScannerReticleIcon } from './icons/MissionIcons'

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
      accentBorder: 'border-amber-400/50',
      badgeBg: 'bg-amber-500/15 border-amber-400/40 text-amber-300',
    },
    riverbed: {
      name: 'Ancient Riverbed',
      icon: '🌊',
      accentBorder: 'border-yellow-400/50',
      badgeBg: 'bg-yellow-500/15 border-yellow-400/40 text-yellow-300',
    },
    ice: {
      name: 'Subsurface Ice Deposit',
      icon: '❄️',
      accentBorder: 'border-cyan-400/50',
      badgeBg: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300',
    },
  }[spot.type]

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none animate-fade-in overflow-y-auto bg-[#04060d]/85 backdrop-blur-md"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div
        className={`mission-panel border ${typeConfig.accentBorder} rounded-[28px] max-w-lg w-full p-4 sm:p-6 text-white flex flex-col gap-4 my-auto max-h-[92dvh] overflow-y-auto animate-modal-in relative`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              {typeConfig.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
                <ScannerReticleIcon size={12} />
                <span>Discovery Collected</span>
              </span>
              <h2 className="font-display text-lg md:text-xl font-bold text-white leading-tight mt-0.5">
                {typeConfig.name}
              </h2>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full border text-xs font-bold font-mono flex items-center gap-1.5 ${typeConfig.badgeBg}`}
          >
            <CrystalSampleIcon size={13} />
            <span>
              +{spot.points} {spot.points === 1 ? 'Point' : 'Points'}!
            </span>
          </div>
        </div>

        {/* Visual Content: Photo or Drawn Ice Illustration */}
        {photo ? (
          <div className="bg-slate-950/75 rounded-2xl p-3 border border-white/[0.08] flex flex-col gap-3">
            {/* Real NASA Photo Viewfinder */}
            <div className="relative w-full bg-black rounded-xl overflow-hidden flex items-center justify-center min-h-[190px] max-h-[260px] border border-white/10">
              <img
                src={`/assets/nasa/${photo.file}`}
                alt={photo.title}
                className="max-h-[260px] w-full object-contain rounded-xl"
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-sky-950/90 backdrop-blur-md text-sky-200 text-[10px] font-mono font-bold tracking-wide shadow-md border border-sky-400/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Real photo from NASA
              </span>
            </div>

            {/* Title & Photo Credit */}
            <div className="px-1 flex flex-col gap-1">
              <h3 className="font-display text-sm sm:text-base font-bold text-white leading-snug">
                {photo.title}
              </h3>
              <p className="text-[11px] text-sky-300/90 font-mono">
                Photo: {photo.credit}
              </p>

              {/* Required Honesty Disclaimers */}
              <div className="mt-2 pt-2.5 border-t border-white/[0.07] text-[11px] text-slate-400 leading-snug space-y-0.5 italic">
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
          <div className="bg-slate-950/80 rounded-2xl p-5 border border-cyan-500/35 flex flex-col items-center text-center gap-3.5">
            <div className="w-24 h-24 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)] relative overflow-hidden">
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
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="15" y1="30" x2="85" y2="70" />
                <line x1="15" y1="70" x2="85" y2="30" />
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
                <polygon
                  points="50,42 57,50 50,58 43,50"
                  fill="rgba(165,243,252,0.6)"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="max-w-xs">
              <h3 className="font-display text-base font-bold text-cyan-200">
                Glacial Ice Sheet Detected
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Subsurface ground radar confirmed ancient frozen water ice beneath the surface regolith. Ice deposits like this are vital for future human expeditions to manufacture rocket propellant and breathable oxygen!
              </p>
            </div>
          </div>
        )}

        {/* Close / Resume Button (Sticky Footer) */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-xl pt-2.5 pb-1 -mx-4 px-4 sm:-mx-6 sm:px-6 border-t border-white/[0.08] mt-auto">
          <button
            onClick={() => {
              sfx('click_soft', { volume: 0.6 })
              closeDiscoveryPopup()
            }}
            className="w-full min-h-[48px] py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:from-orange-600 active:to-amber-600 text-white font-display font-bold rounded-2xl transition-all cursor-pointer shadow-[0_8px_24px_-4px_rgba(249,115,22,0.5)] text-center text-sm sm:text-base tracking-wide active:scale-[0.99]"
          >
            Resume mission
          </button>
        </div>
      </div>
    </div>
  )
}
