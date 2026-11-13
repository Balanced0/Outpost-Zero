import { useState } from 'react'
import { isMuted, setMuted, isMusicMuted, setMusicMuted, sfx } from '../utils/sound'

/**
 * SoundToggle — Sound and Music controls fixed at the top-right.
 * Allows instant 1-tap muting, plus separate ambient music toggle.
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
    <div className="fixed top-3 right-3 z-[60] flex items-center gap-1.5 pointer-events-auto select-none">
      {/* Dropdown controls (when expanded) */}
      {showMenu && (
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-full px-2 py-1 shadow-xl backdrop-blur-sm animate-fade-in text-xs">
          <button
            type="button"
            onClick={toggleMusic}
            title={musicMuted ? 'Turn music on' : 'Turn music off'}
            className={`px-2 py-0.5 rounded-full font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              musicMuted
                ? 'bg-slate-800 text-slate-400 hover:text-white'
                : 'bg-indigo-600/80 text-white hover:bg-indigo-500'
            }`}
          >
            <span>{musicMuted ? '🎵 Off' : '🎵 On'}</span>
          </button>
        </div>
      )}

      {/* Main sound toggle button */}
      <button
        type="button"
        onClick={toggleMute}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu((v) => !v)
        }}
        title={muted ? 'Unmute audio (Right-click for options)' : 'Mute audio (Right-click for options)'}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md border ${
          muted
            ? 'bg-slate-900/80 border-red-500/50 text-red-400 hover:bg-slate-800'
            : 'bg-black/60 border-white/20 text-white hover:bg-black/80 hover:border-sky-400/50'
        }`}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {/* Mini options toggle arrow */}
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        title="Audio options"
        className="w-5 h-5 rounded-full bg-slate-900/70 border border-slate-700/60 hover:border-slate-500 text-[10px] text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
      >
        {showMenu ? '✕' : '⚙️'}
      </button>
    </div>
  )
}
