import { useGameStore } from '../store/gameStore'

interface WhyButtonProps {
  term: string
  className?: string
}

/**
 * Small "?" icon button — opens the centered GlossaryCard overlay.
 * Replaces the old inline tooltip-pill approach.
 */
export default function WhyButton({ term, className = '' }: WhyButtonProps) {
  const openGlossaryCard = useGameStore((s) => s.openGlossaryCard)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openGlossaryCard(term)
      }}
      title={`What is ${term}?`}
      aria-label={`Learn about ${term}`}
      className={[
        'inline-flex items-center justify-center',
        'w-5 h-5 rounded-full',
        'bg-slate-700/80 hover:bg-sky-600/80 active:bg-sky-700',
        'text-slate-300 hover:text-white',
        'text-[11px] font-extrabold leading-none',
        'border border-slate-500/50 hover:border-sky-400/60',
        'shadow-sm transition-all cursor-pointer select-none',
        'align-middle mx-0.5 pointer-events-auto',
        'flex-shrink-0',
        className,
      ].join(' ')}
    >
      ?
    </button>
  )
}
