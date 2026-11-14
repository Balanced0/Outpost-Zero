import { useEffect } from 'react'
import { useGameStore, TutorialStep } from '../store/gameStore'

export default function TutorialHelper() {
  const tutorialStep = useGameStore((s) => s.tutorialStep)
  const hasMovedSliderDay1 = useGameStore((s) => s.hasMovedSliderDay1)
  const dismissTutorial = useGameStore((s) => s.dismissTutorial)
  const commanderName = useGameStore((s) => s.commanderName)

  // ESC key dismisses tutorial
  useEffect(() => {
    if (!tutorialStep) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissTutorial()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tutorialStep, dismissTutorial])

  if (!tutorialStep) {
    return null
  }

  const contentMap: Record<
    Exclude<TutorialStep, null>,
    {
      title: string
      message: string
      tip?: string
      buttonText: string
    }
  > = {
    day1_sliders: {
      title: `Welcome, Commander ${commanderName}!`,
      message:
        'This is your power. It is shared, so giving more to one gives less to the others.',
      tip: hasMovedSliderDay1
        ? 'Great job moving the slider! You can now start driving.'
        : 'Try moving any slider below to see how the power balances.',
      buttonText: hasMovedSliderDay1 ? 'Got it!' : 'Try a Slider',
    },
    day2_driving: {
      title: 'How to Drive Your Rover',
      message:
        'Drive your rover with the Arrow keys, WASD, or the on-screen joystick.',
      tip: 'Watch your battery gauge! If it hits 0%, you will be stranded until sunset rescue.',
      buttonText: "Let's Drive!",
    },
    day3_storm: {
      title: 'Space Weather & Shields',
      message:
        'Check the space weather. Storms hurt the crew unless the shield is strong.',
      tip: 'On storm days, give more power to the Shield to keep the crew safe and healthy!',
      buttonText: 'Understood!',
    },
  }

  const current = contentMap[tutorialStep]

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 pointer-events-auto select-none animate-fade-in overflow-y-auto ${
        tutorialStep === 'day2_driving'
          ? 'bg-[#04060d]/78 backdrop-blur-md'
          : 'bg-[#04060d]/55 backdrop-blur-xs'
      }`}
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="mission-panel border border-cyan-400/50 rounded-[28px] max-w-md w-full p-5 sm:p-6 text-white flex flex-col gap-3.5 my-auto max-h-[92dvh] overflow-y-auto animate-modal-in relative">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
          aria-hidden="true"
        />

        <div className="flex items-start gap-3.5">
          {/* Custom Drawn Robot Assistant (AERO) */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <svg
              viewBox="0 0 64 64"
              className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="32" y1="8" x2="32" y2="16" />
              <circle cx="32" cy="7" r="3" fill="#38bdf8" />
              <rect x="16" y="16" width="32" height="24" rx="6" fill="#0f172a" />
              <circle cx="26" cy="28" r="3" fill="#22d3ee" />
              <circle cx="38" cy="28" r="3" fill="#22d3ee" />
              <path d="M26 34 Q32 38 38 34" stroke="#22d3ee" strokeWidth="2" />
              <path d="M22 40 L16 54 L48 54 L42 40" fill="#0f172a" />
              <circle cx="32" cy="47" r="2.5" fill="#f59e0b" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AERO · Base AI Assistant
              </span>
              <button
                type="button"
                onClick={dismissTutorial}
                className="w-9 h-9 min-w-[36px] min-h-[36px] -m-1.5 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold rounded-full hover:bg-white/10 cursor-pointer transition-colors"
                title="Dismiss (ESC)"
                aria-label="Dismiss Tutorial"
              >
                ✕
              </button>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white mt-0.5 truncate">
              {current.title}
            </h3>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="bg-slate-950/75 rounded-2xl p-3.5 border border-white/[0.08] text-xs sm:text-sm text-slate-200 leading-relaxed flex flex-col gap-2">
          <p className="font-medium text-white">{current.message}</p>
          {current.tip && (
            <p className="text-xs text-cyan-200 font-medium bg-cyan-950/45 p-2.5 rounded-xl border border-cyan-400/25">
              💡 {current.tip}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissTutorial}
          className="w-full min-h-[46px] py-3 px-4 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 active:from-cyan-600 active:to-sky-700 text-white font-display font-bold rounded-xl transition-all cursor-pointer text-xs sm:text-sm tracking-wide shadow-[0_8px_20px_-4px_rgba(6,182,212,0.45)] flex items-center justify-center active:scale-[0.99]"
        >
          {current.buttonText}
        </button>
      </div>
    </div>
  )
}
