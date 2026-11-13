import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { sfx, startLoop, stopLoop, startAmbientMusic, stopAmbientMusic } from '../utils/sound'

/**
 * useGameSounds — connects game state transitions to sound effects,
 * engine sound loops, and ambient space music.
 * Call once at top level (AppInner).
 */
export function useGameSounds() {
  const isGameStarted    = useGameStore((s) => s.isGameStarted)
  const isDriving        = useGameStore((s) => s.isDriving)
  const stormState       = useGameStore((s) => s.stormState)
  const dayPhase         = useGameStore((s) => s.dayPhase)
  const activeScan       = useGameStore((s) => s.activeScan)
  const activeDiscovery  = useGameStore((s) => s.activeDiscovery)
  const scanError        = useGameStore((s) => s.scanError)
  const battery          = useGameStore((s) => s.battery)
  const batteryCapacity  = useGameStore((s) => s.batteryCapacity)
  const isPoweredOff     = useGameStore((s) => s.isPoweredOff)
  const dayEndResult     = useGameStore((s) => s.dayEndResult)
  const isDebriefOpen    = useGameStore((s) => s.isDebriefOpen)
  const glossaryCardTerm = useGameStore((s) => s.glossaryCardTerm)
  const callEarthState   = useGameStore((s) => s.callEarthState)
  const timeLeft         = useGameStore((s) => s.timeLeft)

  const mounted = useRef(false)

  // Previous value refs to detect transitions
  const prevStarted    = useRef(isGameStarted)
  const prevDriving    = useRef(isDriving)
  const prevStorm      = useRef(stormState)
  const prevPhase      = useRef(dayPhase)
  const prevScan       = useRef<boolean>(!!activeScan)
  const prevDiscovery  = useRef<boolean>(!!activeDiscovery)
  const prevScanError  = useRef<string | null>(scanError)
  const prevPoweredOff = useRef(isPoweredOff)
  const prevDayEnd     = useRef<typeof dayEndResult>(null)
  const prevDebrief    = useRef(isDebriefOpen)
  const prevGlossary   = useRef<string | null>(null)
  const prevCallState  = useRef(callEarthState)
  const prevTimeLeft   = useRef(timeLeft)
  const lowBatPinged   = useRef(false)
  const scanIntervalRef = useRef<number | null>(null)

  // Start background music and ambient drone on user interaction or game start
  useEffect(() => {
    const handleFirstInteraction = () => {
      startAmbientMusic()
      if (isGameStarted) {
        startLoop('ambient_drone', 'ambient_drone', { volume: 0.18, fadeIn: 2.0 })
      }
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction)
    window.addEventListener('keydown', handleFirstInteraction)

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [isGameStarted])

  useEffect(() => {
    // Skip first mount frame so we don't trigger sounds on initial load
    if (!mounted.current) {
      mounted.current = true
      return
    }

    // --- Game launch ---
    if (isGameStarted && !prevStarted.current) {
      sfx('launch', { volume: 0.65 })
      startAmbientMusic()
      startLoop('ambient_drone', 'ambient_drone', { volume: 0.18, fadeIn: 1.5 })
    } else if (!isGameStarted && prevStarted.current) {
      stopLoop('ambient_drone', 1.0)
      stopLoop('rover', 0.2)
      stopAmbientMusic()
    }
    prevStarted.current = isGameStarted

    // --- Rover Driving Loop ---
    if (isDriving !== prevDriving.current) {
      if (isDriving) {
        startLoop('rover', 'rover_engine', { volume: 0.32, playbackRate: 0.95, fadeIn: 0.15 })
      } else {
        stopLoop('rover', 0.25)
      }
    }
    prevDriving.current = isDriving

    // --- Storm transitions ---
    if (stormState !== prevStorm.current) {
      if (stormState === 'warning') {
        sfx('solar_flare', { volume: 0.7 })
        sfx('storm_warning', { volume: 0.85 })
      } else if (stormState === 'active') {
        sfx('shield_active', { volume: 0.6 })
        sfx('storm_pulse', { volume: 0.5 })
      } else if (stormState === 'passed') {
        sfx('open_soft', { volume: 0.45 })
      }
    }
    prevStorm.current = stormState

    // --- Day phase changes ---
    if (dayPhase !== prevPhase.current) {
      if (dayPhase === 'daytime') {
        sfx('airlock_open', { volume: 0.55 })
        sfx('confirm', { volume: 0.5 })
      } else if (dayPhase === 'sunset') {
        sfx('sunset', { volume: 0.7 })
      } else if (dayPhase === 'ended') {
        stopLoop('rover', 0.1)
        sfx('airlock_close', { volume: 0.55 })
        sfx('open_card', { volume: 0.6 })
      } else if (dayPhase === 'morning') {
        sfx('open_card', { volume: 0.45 })
      }
    }
    prevPhase.current = dayPhase

    // --- Sunset countdown warning (when crossing 20s mark) ---
    const SUNSET_WARN = 20
    if (
      dayPhase === 'sunset' &&
      timeLeft <= SUNSET_WARN &&
      prevTimeLeft.current > SUNSET_WARN
    ) {
      sfx('sunset', { volume: 0.75 })
    }
    prevTimeLeft.current = timeLeft

    // --- Scientific Scanning ---
    const isScanning = !!activeScan
    if (isScanning !== prevScan.current) {
      if (isScanning) {
        sfx('scan_start', { volume: 0.65 })
        // Repeating radar ping while scanning
        scanIntervalRef.current = window.setInterval(() => {
          sfx('scan_ping', { volume: 0.5 })
        }, 850)
      } else {
        if (scanIntervalRef.current !== null) {
          clearInterval(scanIntervalRef.current)
          scanIntervalRef.current = null
        }
      }
    }
    prevScan.current = isScanning

    // --- Discovery collected ---
    const hasDiscovery = !!activeDiscovery
    if (hasDiscovery && !prevDiscovery.current) {
      sfx('discovery', { volume: 0.9 })
      sfx('scan_done', { volume: 0.8 })
    }
    prevDiscovery.current = hasDiscovery

    // --- Scan error (insufficient battery or rover moved) ---
    if (scanError && scanError !== prevScanError.current) {
      sfx('error_soft', { volume: 0.65 })
    }
    prevScanError.current = scanError

    // --- Power off ---
    if (isPoweredOff && !prevPoweredOff.current) {
      stopLoop('rover', 0.1)
      sfx('power_off', { volume: 0.8 })
    }
    prevPoweredOff.current = isPoweredOff

    // --- Low battery alert (< 25% capacity) ---
    if (batteryCapacity > 0 && battery / batteryCapacity < 0.25 && battery > 0 && !lowBatPinged.current) {
      sfx('low_battery', { volume: 0.7 })
      lowBatPinged.current = true
    }
    if (battery >= batteryCapacity * 0.5) {
      lowBatPinged.current = false
    }

    // --- Day end result card ---
    if (dayEndResult && !prevDayEnd.current) {
      sfx('open_card', { volume: 0.65 })
    }
    prevDayEnd.current = dayEndResult

    // --- Debrief screen ---
    if (isDebriefOpen && !prevDebrief.current) {
      sfx('confirm_big', { volume: 0.7 })
    }
    prevDebrief.current = isDebriefOpen

    // --- Glossary card ---
    if (glossaryCardTerm && !prevGlossary.current) {
      sfx('glossary_open', { volume: 0.55 })
    }
    prevGlossary.current = glossaryCardTerm

    // --- Call Earth response received ---
    if (callEarthState === 'received' && prevCallState.current !== 'received') {
      sfx('bong', { volume: 0.6 })
      sfx('toggle', { volume: 0.5 })
    }
    prevCallState.current = callEarthState
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current !== null) {
        clearInterval(scanIntervalRef.current)
      }
      stopLoop('rover', 0.1)
      stopLoop('ambient_drone', 0.2)
      stopAmbientMusic()
    }
  }, [])
}
