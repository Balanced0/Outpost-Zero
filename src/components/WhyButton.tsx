import { useState, useEffect, useRef } from 'react'
import { getGlossaryEntry } from '../data/glossary'

interface WhyButtonProps {
  term: string
  label?: string
  className?: string
}

export default function WhyButton({ term, label = 'Why?', className = '' }: WhyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const entry = getGlossaryEntry(term)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span className="inline-flex items-center relative align-middle mx-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className={`px-1.5 py-0.5 bg-blue-600/80 hover:bg-blue-500 text-[10px] font-extrabold rounded-md text-white border border-blue-400/50 shadow-sm transition-all cursor-pointer select-none leading-none pointer-events-auto ${className}`}
        title={`Learn more about ${entry.title}`}
      >
        {label}
      </button>

      {/* Floating explanation popup */}
      {isOpen && (
        <div
          ref={popupRef}
          role="dialog"
          aria-label={entry.title}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 md:w-72 bg-slate-900/98 border border-sky-400/60 rounded-2xl p-3.5 text-white shadow-2xl z-50 animate-fade-in pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <span>🚀</span>
              <span>{entry.title}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white font-bold text-xs p-1 leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {entry.explanation}
          </p>
          {/* Tooltip beak */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  )
}

