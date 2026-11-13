import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { getGlossaryEntry } from '../data/glossary'

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
    // Dim overlay — click outside to close
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center p-4 pointer-events-auto select-none"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
      onPointerDown={(e) => {
        // Close only if clicking the backdrop itself, not the card
        if (e.target === e.currentTarget) closeGlossaryCard()
      }}
    >
      {/* Card — bounce-in animation */}
      <div
        className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl max-w-sm w-full p-7 shadow-2xl flex flex-col items-center text-center gap-5"
        style={{ animation: 'glossaryBounceIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Big emoji */}
        <div className="w-20 h-20 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-5xl">
          {entry.emoji}
        </div>

        {/* Title */}
        <div>
          <span className="text-[11px] font-bold tracking-widest text-sky-400 uppercase">
            Did you know?
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">{entry.title}</h2>
        </div>

        {/* Explanation */}
        <p className="text-sm text-slate-200 leading-relaxed">{entry.explanation}</p>

        {/* Got it! button */}
        <button
          type="button"
          onClick={closeGlossaryCard}
          className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-sky-900/50 text-base"
        >
          Got it! 👍
        </button>
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes glossaryBounceIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

