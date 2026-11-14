/**
 * MoonEarth — a small blue-white Earth globe drawn in SVG,
 * shown as a fixed UI element only when playing the Moon map.
 */
import { useGameStore } from '../store/gameStore'

export default function MoonEarth() {
  const planet = useGameStore((s) => s.planet)
  const isGameStarted = useGameStore((s) => s.isGameStarted)

  if (!isGameStarted || planet !== 'moon') return null

  return (
    <div
      className="fixed z-20 pointer-events-none select-none"
      style={{ bottom: '7rem', right: '1rem' }}
      aria-hidden="true"
    >
      <svg width="52" height="52" viewBox="0 0 52 52">
        {/* Ocean base */}
        <circle cx="26" cy="26" r="23" fill="#1a56a0" />

        {/* Land masses */}
        <ellipse cx="20" cy="22" rx="6" ry="9" fill="#2d7a3a" opacity="0.75" transform="rotate(10,20,22)" />
        <ellipse cx="34" cy="20" rx="4" ry="6" fill="#2d7a3a" opacity="0.65" transform="rotate(-8,34,20)" />
        <ellipse cx="22" cy="36" rx="7" ry="4" fill="#2d7a3a" opacity="0.60" transform="rotate(5,22,36)" />

        {/* Cloud streaks */}
        <ellipse cx="16" cy="14" rx="8" ry="4" fill="white" opacity="0.70" transform="rotate(-18,16,14)" />
        <ellipse cx="32" cy="24" rx="6" ry="3" fill="white" opacity="0.60" transform="rotate(12,32,24)" />
        <ellipse cx="20" cy="38" rx="9" ry="3.5" fill="white" opacity="0.55" transform="rotate(-8,20,38)" />

        {/* Thin atmosphere glow at the edge */}
        <circle cx="26" cy="26" r="23" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.45" />
      </svg>
      <p className="text-[9px] text-blue-300 font-mono text-center mt-0.5 opacity-75 tracking-wide">
        Earth
      </p>
    </div>
  )
}

