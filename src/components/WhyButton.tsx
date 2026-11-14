import { useGameStore } from '../store/gameStore'
import { sfx } from '../utils/sound'

interface WhyButtonProps {
  term: string
  className?: string
}

/**
 * Accessible "?" telemetry info button with minimum 44px touch target.
 * Opens the centered GlossaryCard overlay.
 */
export default function WhyButton({ term, className = '' }: WhyButtonProps) {
  const openGlossaryCard = useGameStore((s) => s.openGlossaryCard)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        sfx('click_soft', { volume: 0.6 })
        openGlossaryCard(term)
      }}
      title={`What is ${term}?`}
      aria-label={`Learn about ${term}`}
      className={[
        'group inline-flex items-center justify-center',
        'min-w-[44px] min-h-[44px]',
        'p-2.5 -m-2.5',
        'cursor-pointer select-none pointer-events-auto flex-shrink-0 align-middle',
        'bg-transparent border-0 focus:outline-none',
        className,
      ].join(' ')}
    >
      <span className="w-[18px] h-[18px] rounded-full bg-slate-800/90 group-hover:bg-sky-500/25 group-active:bg-sky-500/40 text-slate-300 group-hover:text-sky-300 text-[10px] font-mono font-bold leading-none border border-white/15 group-hover:border-sky-400/60 shadow-[0_1px_2px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_10px_rgba(56,189,248,0.35)] flex items-center justify-center transition-all duration-150 group-active:scale-90">
        ?
      </span>
    </button>
  )
}
