import { useGameStore } from '../store/gameStore'
import { SUNSET_WARN_SEC } from '../config/gameConfig'

export default function SunsetOverlay() {
  const timeLeft = useGameStore((s) => s.timeLeft)
  const dayPhase = useGameStore((s) => s.dayPhase)

  // Only render when entering sunset or when day ended
  if (dayPhase === 'morning' || (timeLeft > SUNSET_WARN_SEC && dayPhase !== 'ended')) {
    return null
  }

  // 0 when sunset starts (20s left), 1 when sunset completes (0s left)
  const progress =
    dayPhase === 'ended'
      ? 1
      : Math.max(0, Math.min(1, (SUNSET_WARN_SEC - timeLeft) / SUNSET_WARN_SEC))

  // Orange sunset tint peaks midway through the sunset
  const orangeOpacity =
    progress < 0.5
      ? progress * 0.9 // 0 -> 0.45
      : (1 - progress) * 0.9 // 0.45 -> 0

  // Dark blue night sky darkness ramps up from 0 to 0.78
  const nightOpacity = progress * 0.78

  return (
    <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300">
      {/* Warm orange Martian sunset glow */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-orange-600 via-amber-700 to-orange-950 mix-blend-color-burn"
        style={{ opacity: orangeOpacity }}
      />
      {/* Deep Martian twilight into dark night */}
      <div
        className="absolute inset-0 bg-[#060b1c]"
        style={{ opacity: nightOpacity }}
      />
    </div>
  )
}

