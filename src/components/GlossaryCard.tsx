import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { getGlossaryEntry } from '../data/glossary'
import { sfx } from '../utils/sound'

/**
 * GlossaryCard — centered full-screen overlay card shown when a "?" button is tapped.
 * Closes with "Got it!", ESC, or a tap on the dim background.
 * While open the day timer is paused (guard in gameStore.tickDayTimer).
 */
export default function GlossaryCard() {
  const term = useGameStore((s) => s.glossaryCardTerm)
  const closeGlossaryCard = useGameStore((s) => s.closeGlossaryCard)

  // ESC to close
  useEffect(() => {
    if (!term) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGlossaryCard()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [term, closeGlossaryCard])

  if (!term) return null

  const entry = getGlossaryEntry(term)

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-auto select-none overflow-y-auto"
      style={{
        background: 'rgba(3, 6, 14, 0.76)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeGlossaryCard()
      }}
    >
      {/* Card */}
      <div
        className="mission-panel rounded-3xl max-w-sm w-full p-6 sm:p-7 flex flex-col items-center text-center gap-4 my-auto max-h-[92dvh] overflow-y-auto relative overflow-hidden border border-sky-400/35"
        style={{ animation: 'glossaryBounceIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top ambient glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-32 rounded-full bg-sky-500/20 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top close button */}
        <button
          type="button"
          onClick={() => {
            sfx('click_soft', { volume: 0.5 })
            closeGlossaryCard()
          }}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Emblem */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-sky-500/20 to-sky-950/40 border border-sky-400/35 shadow-[0_0_25px_rgba(56,189,248,0.2)] flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0">
          {entry.emoji}
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-mono font-bold tracking-widest text-sky-300 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            NASA Field Guide
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {entry.title}
          </h2>
        </div>

        {/* Explanation */}
        <div className="w-full bg-slate-950/60 border border-white/[0.07] rounded-2xl p-4">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {entry.explanation}
          </p>
        </div>

        {/* Got it! button */}
        <button
          type="button"
          onClick={() => {
            sfx('confirm', { volume: 0.55 })
            closeGlossaryCard()
          }}
          className="w-full min-h-[48px] py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:from-sky-600 active:to-blue-700 text-white font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-[0_8px_20px_-4px_rgba(14,165,233,0.45)] text-sm sm:text-base active:scale-[0.99]"
        >
          Got it
        </button>
      </div>

      <style>{`
        @keyframes glossaryBounceIn {
          from { opacity: 0; transform: translateY(10px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
