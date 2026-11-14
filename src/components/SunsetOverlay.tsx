import { useGameStore } from '../store/gameStore'
import { SUNSET_WARN_SEC } from '../config/gameConfig'

export default function SunsetOverlay() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const timeLeft = useGameStore((s) => s.timeLeft)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const planet = useGameStore((s) => s.planet)

  if (!isGameStarted) {
    return null
  }

  // Only render when entering sunset/night or when day ended
  if (dayPhase === 'morning' || (timeLeft > SUNSET_WARN_SEC && dayPhase !== 'ended')) {
    return null
  }

  // 0 when sunset starts (20s left), 1 when night arrives (0s left)
  const progress =
    dayPhase === 'ended'
      ? 1
      : Math.max(0, Math.min(1, (SUNSET_WARN_SEC - timeLeft) / SUNSET_WARN_SEC))

  // Orange sunset tint for Mars only (Moon has no atmosphere/dust)
  const isMars = planet === 'mars'
  const orangeOpacity = isMars
    ? progress < 0.5
      ? progress * 0.9 // 0 -> 0.45
      : (1 - progress) * 0.9 // 0.45 -> 0
    : 0

  // Night darkness ramps up from 0 to 0.85
  const nightOpacity = progress * (isMars ? 0.8 : 0.88)

  return (
    <div className="fixed inset-0 w-[100vw] h-[100dvh] pointer-events-none z-10 transition-opacity duration-300 overflow-hidden">
      {/* Warm orange Martian dust sunset glow (Mars only) */}
      {isMars && (
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-orange-600 via-amber-700 to-orange-950 mix-blend-color-burn"
          style={{ opacity: orangeOpacity }}
        />
      )}

      {/* Deep Martian twilight into night OR Moon pitch-black space */}
      <div
        className={`absolute inset-0 w-full h-full ${isMars ? 'bg-[#060b1c]' : 'bg-[#000000]'}`}
        style={{ opacity: nightOpacity }}
      />
    </div>
  )
}
