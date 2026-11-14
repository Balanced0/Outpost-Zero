import { useState } from 'react'
import { isMuted, setMuted, isMusicMuted, setMusicMuted, sfx } from '../utils/sound'

/**
 * SoundToggle — Sound and Music controls.
 * Fixed in safe-area top-right corner with 44px touch targets.
 * Positioned in its own dedicated corner slot so it never overlaps HUD meters.
 */
export default function SoundToggle() {
  const [muted, setLocalMuted] = useState(isMuted())
  const [musicMuted, setLocalMusicMuted] = useState(isMusicMuted())
  const [showMenu, setShowMenu] = useState(false)

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setLocalMuted(next)
    if (!next) {
      sfx('click', { volume: 0.6 })
    }
  }

  const toggleMusic = () => {
    const next = !musicMuted
    setMusicMuted(next)
    setLocalMusicMuted(next)
    sfx('toggle', { volume: 0.5 })
  }

  return (
    <div className="fixed top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] z-[60] flex items-center gap-1.5 pointer-events-auto select-none">
      {/* Dropdown controls (when expanded) */}
      {showMenu && (
        <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-700 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md animate-fade-in text-xs">
          <button
            type="button"
            onClick={toggleMusic}
            title={musicMuted ? 'Turn music on' : 'Turn music off'}
            className={`min-h-[44px] px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              musicMuted
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <span>{musicMuted ? '🎵 Music Off' : '🎵 Music On'}</span>
          </button>
        </div>
      )}

      {/* Main sound toggle button (min 44px touch target) */}
      <button
        type="button"
        onClick={toggleMute}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu((v) => !v)
        }}
        title={muted ? 'Unmute audio (tap ⚙ for options)' : 'Mute audio (tap ⚙ for options)'}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-xl cursor-pointer transition-all shadow-lg border active:scale-95 ${
          muted
            ? 'bg-slate-900/90 border-red-500/60 text-red-400 hover:bg-slate-800'
            : 'bg-black/75 border-white/25 text-white hover:bg-black/90 hover:border-sky-400/60'
        }`}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Options toggle button (min 44px touch target) */}
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        title="Audio options"
        aria-label="Audio options"
        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-xs text-slate-300 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
      >
        {showMenu ? '✕' : '⚙️'}
      </button>
    </div>
  )
}
