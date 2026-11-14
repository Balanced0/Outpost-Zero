/**
 * MoonEarth — a blue-white Earth globe drawn in SVG,
 * shown as a fixed UI element only when playing the Moon map.
 */
import { useGameStore } from '../store/gameStore'

export default function MoonEarth() {
  const planet = useGameStore((s) => s.planet)
  const isGameStarted = useGameStore((s) => s.isGameStarted)

  if (!isGameStarted || planet !== 'moon') return null

  return (
    <div
      className="fixed z-20 pointer-events-none select-none flex flex-col items-center"
      style={{ bottom: '7rem', right: '1.1rem' }}
      aria-hidden="true"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-md" />
        <svg width="52" height="52" viewBox="0 0 52 52" className="relative">
          {/* Ocean base */}
          <circle cx="26" cy="26" r="22" fill="url(#earthOceanGrad)" />

          {/* Land masses */}
          <ellipse
            cx="20"
            cy="22"
            rx="6"
            ry="9"
            fill="#34d399"
            opacity="0.65"
            transform="rotate(10,20,22)"
          />
          <ellipse
            cx="34"
            cy="20"
            rx="4"
            ry="6"
            fill="#10b981"
            opacity="0.55"
            transform="rotate(-8,34,20)"
          />
          <ellipse
            cx="22"
            cy="36"
            rx="7"
            ry="4"
            fill="#10b981"
            opacity="0.5"
            transform="rotate(5,22,36)"
          />

          {/* Cloud streaks */}
          <ellipse
            cx="16"
            cy="14"
            rx="8"
            ry="3.5"
            fill="white"
            opacity="0.7"
            transform="rotate(-18,16,14)"
          />
          <ellipse
            cx="32"
            cy="24"
            rx="6"
            ry="2.5"
            fill="white"
            opacity="0.6"
            transform="rotate(12,32,24)"
          />
          <ellipse
            cx="20"
            cy="38"
            rx="9"
            ry="3"
            fill="white"
            opacity="0.55"
            transform="rotate(-8,20,38)"
          />

          {/* Thin atmosphere glow at the edge */}
          <circle
            cx="26"
            cy="26"
            r="22.5"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.5"
            opacity="0.6"
          />

          <defs>
            <radialGradient
              id="earthOceanGrad"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(18 16) rotate(45) scale(32)"
            >
              <stop stopColor="#2563eb" />
              <stop offset="1" stopColor="#0f172a" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="text-[9px] text-sky-300/90 font-mono text-center mt-1 tracking-widest uppercase">
        Earth · 384,400 km
      </p>
    </div>
  )
}
