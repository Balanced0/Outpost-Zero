import { useRef, useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { sfx } from '../utils/sound'

const OUTER_RADIUS = 44   // 88px diameter outer ring
const THUMB_RADIUS = 20   // 40px diameter thumb

/**
 * TouchControls — Virtual Joystick on bottom-left, Touch Scan button on bottom-right.
 * Shown only on touch-capable devices.
 * Uses touch-action: none and e.preventDefault() to strictly prevent page scrolling/zooming.
 */
export default function Joystick() {
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const setJoystick = useGameStore((s) => s.setJoystick)
  const setIsDriving = useGameStore((s) => s.setIsDriving)
  const isControlsLocked = useGameStore((s) => s.isControlsLocked)
  const isPoweredOff = useGameStore((s) => s.isPoweredOff)
  const dayPhase = useGameStore((s) => s.dayPhase)
  const isMissionComplete = useGameStore((s) => s.isMissionComplete)

  const nearbySpot = useGameStore((s) => s.nearbySpot)
  const activeScan = useGameStore((s) => s.activeScan)
  const startScan = useGameStore((s) => s.startScan)

  // Detect touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches)
    setIsTouchDevice(isTouch)
  }, [])

  // Thumb position offset from center (in px)
  const thumbRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const activeTouchId = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  if (!isGameStarted || !isTouchDevice || dayPhase === 'morning' || dayPhase === 'ended' || isMissionComplete) {
    return null
  }

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
    e.preventDefault()
    if (isControlsLocked || isPoweredOff) return
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
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        resetThumb()
        break
      }
    }
  }

  return (
    <>
      {/* 1. Virtual Joystick — Bottom-Left (Safe Area Insets Respected) */}
      <div
        className="fixed z-30 pointer-events-none select-none"
        style={{
          left: 'max(1rem, env(safe-area-inset-left))',
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          touchAction: 'none',
        }}
      >
        <div
          ref={outerRef}
          className="relative flex items-center justify-center rounded-full bg-slate-900/60 border-2 border-white/30 backdrop-blur-sm pointer-events-auto shadow-2xl active:border-orange-400"
          style={{
            width: OUTER_RADIUS * 2,
            height: OUTER_RADIUS * 2,
            touchAction: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/* Subtle directional cross markings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-0.5 bg-white" />
            <div className="h-full w-0.5 bg-white absolute" />
          </div>

          {/* Inner thumb */}
          <div
            ref={thumbRef}
            className="rounded-full bg-gradient-to-tr from-white to-orange-200 border border-orange-400/50 shadow-lg pointer-events-none"
            style={{
              width: THUMB_RADIUS * 2,
              height: THUMB_RADIUS * 2,
              transition: 'transform 0.04s ease-out',
            }}
          />
        </div>
      </div>

      {/* 2. Dedicated Touch Scan Button — Bottom-Right (Safe Area Insets Respected) */}
      <div
        className="fixed z-30 pointer-events-none select-none flex flex-col items-center gap-1.5"
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
          bottom: 'max(1rem, env(safe-area-inset-bottom))',
          touchAction: 'none',
        }}
      >
        {activeScan ? (
          // While scanning: prominent scanning state with progress
          <div
            className="w-16 h-16 min-w-[56px] min-h-[56px] rounded-full bg-cyan-950/90 border-2 border-cyan-400 text-cyan-300 shadow-2xl flex flex-col items-center justify-center pointer-events-auto"
            style={{ touchAction: 'none' }}
          >
            <div className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-0.5" />
            <span className="font-mono text-[10px] font-bold">
              {(activeScan.duration - activeScan.elapsed).toFixed(1)}s
            </span>
          </div>
        ) : nearbySpot ? (
          // Active nearby discovery: pulsing, thumb-friendly 60px button
          <button
            type="button"
            onClick={() => {
              sfx('scan', { volume: 0.7 })
              startScan()
            }}
            className="w-16 h-16 min-w-[56px] min-h-[56px] rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-extrabold shadow-2xl border-2 border-amber-300 flex flex-col items-center justify-center pointer-events-auto cursor-pointer animate-bounce"
            style={{ touchAction: 'none' }}
            title="Scan Discovery"
            aria-label="Scan Discovery"
          >
            <span className="text-xl">🔬</span>
            <span className="text-[10px] font-bold uppercase tracking-tight leading-none mt-0.5">
              Scan
            </span>
          </button>
        ) : (
          // Inactive Scan placeholder: allows player to know where button is
          <div
            className="w-16 h-16 min-w-[56px] min-h-[56px] rounded-full bg-slate-900/40 border border-slate-700/60 text-slate-500 flex flex-col items-center justify-center pointer-events-auto opacity-50"
            style={{ touchAction: 'none' }}
          >
            <span className="text-lg">🔬</span>
            <span className="text-[9px] uppercase tracking-tight font-semibold mt-0.5">
              Scan
            </span>
          </div>
        )}
      </div>
    </>
  )
}
