import { useRef } from 'react'
import { useGameStore } from '../store/gameStore'

const OUTER_RADIUS = 40   // half of 80px diameter
const THUMB_RADIUS = 18   // half of 36px diameter

export default function Joystick() {
  const setJoystick = useGameStore((s) => s.setJoystick)
  const setIsDriving = useGameStore((s) => s.setIsDriving)

  // Thumb position offset from center (in px)
  const thumbRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const activeTouchId = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  function updateThumb(tx: number, ty: number) {
    const outer = outerRef.current
    const thumb = thumbRef.current
    if (!outer || !thumb || !originRef.current) return

    const rawDx = tx - originRef.current.x
    const rawDy = ty - originRef.current.y
    const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy)
    const clampedDist = Math.min(dist, OUTER_RADIUS - THUMB_RADIUS)
    const angle = Math.atan2(rawDy, rawDx)

    const clampedX = Math.cos(angle) * clampedDist
    const clampedY = Math.sin(angle) * clampedDist

    // Move thumb visually
    thumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`

    // Normalize to -1..1
    const maxMove = OUTER_RADIUS - THUMB_RADIUS
    const normX = maxMove > 0 ? clampedX / maxMove : 0
    const normY = maxMove > 0 ? clampedY / maxMove : 0

    setJoystick(normX, normY)
    setIsDriving(Math.abs(normX) > 0.05 || Math.abs(normY) > 0.05)
  }

  function resetThumb() {
    const thumb = thumbRef.current
    if (thumb) thumb.style.transform = 'translate(0px, 0px)'
    setJoystick(0, 0)
    setIsDriving(false)
    activeTouchId.current = null
    originRef.current = null
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const store = useGameStore.getState()
    if (store.isControlsLocked || store.isPoweredOff || store.dayPhase === 'ended') return
    if (activeTouchId.current !== null) return
    const touch = e.changedTouches[0]
    activeTouchId.current = touch.identifier
    const rect = outerRef.current!.getBoundingClientRect()
    originRef.current = {
      x: rect.left + OUTER_RADIUS,
      y: rect.top + OUTER_RADIUS,
    }
    updateThumb(touch.clientX, touch.clientY)
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === activeTouchId.current) {
        updateThumb(touch.clientX, touch.clientY)
        break
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        resetThumb()
        break
      }
    }
  }

  return (
    // Hidden on sm screens and up (≥640px), visible on xs/mobile
    <div className="sm:hidden absolute bottom-8 left-8 z-10 pointer-events-none">
      {/* Outer ring */}
      <div
        ref={outerRef}
        className="relative flex items-center justify-center rounded-full bg-white/10 border-2 border-white/30 pointer-events-auto select-none"
        style={{ width: OUTER_RADIUS * 2, height: OUTER_RADIUS * 2 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Inner thumb */}
        <div
          ref={thumbRef}
          className="rounded-full bg-white shadow-lg"
          style={{
            width: THUMB_RADIUS * 2,
            height: THUMB_RADIUS * 2,
            transition: 'transform 0.05s ease-out',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
