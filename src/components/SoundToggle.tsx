import { useState } from 'react'
import { isMuted, setMuted, isMusicMuted, setMusicMuted, sfx } from '../utils/sound'
import {
  SoundWaveIcon,
  SoundMuteIcon,
  MusicNoteIcon,
  SlidersIcon,
} from './icons/MissionIcons'

/**
 * SoundToggle — Sound and Music telemetry controls.
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
        <div className="flex items-center gap-1.5 hud-glass rounded-full p-1 shadow-2xl animate-fade-in text-xs">
          <button
            type="button"
            onClick={toggleMusic}
            title={musicMuted ? 'Turn ambient synth music on' : 'Turn ambient synth music off'}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer text-[11px] tracking-wide ${
              musicMuted
                ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                : 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:bg-indigo-500/30'
            }`}
          >
            <MusicNoteIcon size={13} className={musicMuted ? 'text-slate-500' : 'text-indigo-300'} />
            <span>{musicMuted ? 'Music Off' : 'Music On'}</span>
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
        title={muted ? 'Unmute audio (tap options for music)' : 'Mute audio (tap options for music)'}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 relative ${
          muted
            ? 'hud-glass border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:border-rose-400/80'
            : 'hud-glass text-slate-200 hover:text-white hover:border-white/25'
        }`}
      >
        {muted ? <SoundMuteIcon size={18} /> : <SoundWaveIcon size={18} />}
        <span
          className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
            muted ? 'bg-rose-500' : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
          }`}
        />
      </button>

      {/* Options toggle button (min 44px touch target) */}
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        title="Audio options"
        aria-label="Audio options"
        className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full hud-glass flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 ${
          showMenu
            ? 'border-sky-400/50 text-sky-300 bg-sky-950/40'
            : 'text-slate-300 hover:text-white hover:border-white/25'
        }`}
      >
        {showMenu ? (
          <span className="text-xs font-bold leading-none">✕</span>
        ) : (
          <SlidersIcon size={16} />
        )}
      </button>
    </div>
  )
}
