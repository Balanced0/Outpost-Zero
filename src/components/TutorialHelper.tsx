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
      className={`absolute inset-0 z-40 flex items-center justify-center p-4 pointer-events-auto select-none animate-fade-in ${
        tutorialStep === 'day2_driving' ? 'bg-black/75 backdrop-blur-sm' : 'bg-black/50'
      }`}
    >
      <div className="bg-slate-900/95 border-2 border-cyan-400/80 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl flex flex-col gap-3 my-auto">
        <div className="flex items-start gap-3.5">
          {/* Custom Drawn Robot Assistant (AERO) */}
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-950/50">
            <svg
              viewBox="0 0 64 64"
              className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Antenna */}
              <line x1="32" y1="8" x2="32" y2="16" />
              <circle cx="32" cy="7" r="3" fill="#38bdf8" />
              {/* Head */}
              <rect x="16" y="16" width="32" height="24" rx="6" fill="#0f172a" />
              {/* Eyes */}
              <circle cx="26" cy="28" r="3" fill="#22d3ee" />
              <circle cx="38" cy="28" r="3" fill="#22d3ee" />
              {/* Friendly smile */}
              <path d="M26 34 Q32 38 38 34" stroke="#22d3ee" strokeWidth="2" />
              {/* Body */}
              <path d="M22 40 L16 54 L48 54 L42 40" fill="#0f172a" />
              {/* Chest light */}
              <circle cx="32" cy="47" r="2.5" fill="#f59e0b" />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                AERO • Base Assistant
              </span>
              <button
                type="button"
                onClick={dismissTutorial}
                className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                title="Dismiss (ESC)"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              {current.title}
            </h3>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 text-xs text-slate-200 leading-relaxed flex flex-col gap-1.5">
          <p className="font-medium text-white">{current.message}</p>
          {current.tip && (
            <p className="text-[11px] text-cyan-300 font-semibold bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/30">
              💡 {current.tip}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={dismissTutorial}
          className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs tracking-wide shadow-md shadow-cyan-950/40"
        >
          {current.buttonText}
        </button>
      </div>
    </div>
  )
}

