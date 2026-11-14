import { useGameStore } from '../store/gameStore'
import { sfx } from '../utils/sound'

interface WhyButtonProps {
  term: string
  className?: string
}

/**
 * Accessible "?" button with minimum 44px touch target.
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
        'inline-flex items-center justify-center',
        'min-w-[44px] min-h-[44px]',
        'p-2.5 -m-2.5',
        'cursor-pointer select-none pointer-events-auto flex-shrink-0 align-middle',
        'bg-transparent border-0',
        className,
      ].join(' ')}
    >
      <span className="w-5 h-5 rounded-full bg-slate-700/80 hover:bg-sky-600 active:bg-sky-700 text-slate-300 hover:text-white text-[11px] font-extrabold leading-none border border-slate-500/60 hover:border-sky-400/80 shadow-sm flex items-center justify-center transition-all">
        ?
      </span>
    </button>
  )
}
