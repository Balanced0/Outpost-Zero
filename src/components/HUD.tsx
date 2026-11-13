import { useGameStore, BASE_X, BASE_Y } from '../store/gameStore'

export default function HUD() {
  const battery = useGameStore((s) => s.battery)
  const roverX = useGameStore((s) => s.roverX)
  const roverY = useGameStore((s) => s.roverY)
  const isPoweredOff = useGameStore((s) => s.isPoweredOff)
  const setBattery = useGameStore((s) => s.setBattery)
  const setIsPoweredOff = useGameStore((s) => s.setIsPoweredOff)

  // Battery bar color
  const batteryColor =
    battery > 50
      ? 'bg-green-500'
      : battery >= 20
      ? 'bg-yellow-400'
      : 'bg-red-500'

  // Distance to base
  const dx = BASE_X - roverX
  const dy = BASE_Y - roverY
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy))
  const isRecharging = distance <= 150

  // Arrow angle: atan2 gives angle from positive-x axis; we offset by -90 because
  // the arrow glyph (↑) naturally points up (negative-y axis in screen coords).
  const angleRad = Math.atan2(dy, dx)
  const angleDeg = (angleRad * 180) / Math.PI + 90

  return (
    <>
      {/* HUD overlay — pointer-events: none so Phaser receives all input */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top-left panel */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">

          {/* A) Battery gauge */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 w-48">
            <div className="text-white text-xs font-semibold mb-1">🔋 Rover Battery</div>
            <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-in-out ${batteryColor}`}
                style={{ width: `${Math.max(0, Math.min(100, battery))}%` }}
              />
            </div>
            <div className="text-white text-xs text-right mt-1 font-mono">
              {Math.round(battery)}%
            </div>
          </div>

          {/* B) Base direction arrow */}
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 w-48">
            {/* Circular arrow indicator */}
            <div
              className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center flex-shrink-0 text-white text-lg leading-none"
              style={{ transform: `rotate(${angleDeg}deg)` }}
            >
              ↑
            </div>
            {isRecharging ? (
              <span className="text-green-400 text-xs font-semibold">⚡ Recharging!</span>
            ) : (
              <span className="text-white text-xs font-mono">Base: {distance} m</span>
            )}
          </div>
        </div>
      </div>

      {/* C) Power-off overlay — pointer-events: auto */}
      {isPoweredOff && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
          <p className="text-white text-4xl font-bold mb-3 tracking-wide">Rover out of power</p>
          <p className="text-gray-300 text-lg mb-8">Your rover stopped moving because the battery reached 0%.</p>
          <button
            onClick={() => {
              setBattery(100)
              setIsPoweredOff(false)
              window.dispatchEvent(new CustomEvent('reset-rover-to-base'))
            }}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-lg"
          >
            Tow Rover to Base & Recharge
          </button>
        </div>
      )}
    </>
  )
}
