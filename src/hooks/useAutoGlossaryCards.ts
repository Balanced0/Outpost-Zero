import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Auto-card trigger keys and their glossary terms.
 * The first time each event fires (outside tutorial days) the card is auto-opened, once only.
 */
export type AutoCardKey =
  | 'storm_radiation'
  | 'scan'
  | 'comms_delay'
  | 'low_battery'
  | 'sunset_warning'

const STORAGE_KEY = 'outpost_zero_seen_hints'

function getSeenHints(): Set<AutoCardKey> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as AutoCardKey[])
  } catch {
    return new Set()
  }
}

function markSeen(key: AutoCardKey) {
  try {
    const seen = getSeenHints()
    seen.add(key)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
  } catch { /* ignore */ }
}

export function resetSeenHints() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

/**
 * Maps an auto-card key to the glossary term that should open.
 */
const AUTO_CARD_TERMS: Record<AutoCardKey, string> = {
  storm_radiation: 'radiation',
  scan: 'scan',
  comms_delay: 'comms delay',
  low_battery: 'rover battery',
  sunset_warning: 'sunset',
}

/**
 * React hook — call once at app level.
 * Watches game state and auto-opens the glossary card the first time each event fires,
 * but never during tutorial days (tutorialStep !== null).
 */
export function useAutoGlossaryCards() {
  const tutorialStep = useGameStore((s) => s.tutorialStep)
  const stormState   = useGameStore((s) => s.stormState)
  const activeScan   = useGameStore((s) => s.activeScan)
  const callEarthState = useGameStore((s) => s.callEarthState)
  const battery      = useGameStore((s) => s.battery)
  const batteryCapacity = useGameStore((s) => s.batteryCapacity)
  const timeLeft     = useGameStore((s) => s.timeLeft)
  const dayPhase     = useGameStore((s) => s.dayPhase)
  const isGameStarted = useGameStore((s) => s.isGameStarted)
  const glossaryCardTerm = useGameStore((s) => s.glossaryCardTerm)
  const openGlossaryCard = useGameStore((s) => s.openGlossaryCard)
  const isDebriefOpen = useGameStore((s) => s.isDebriefOpen)

  // Track previous storm state so we detect the transition to 'warning'
  const prevStormState = useRef(stormState)
  const prevScanActive = useRef(!!activeScan)
  const prevCallState  = useRef(callEarthState)
  const prevTimeLeft   = useRef(timeLeft)

  const tryOpen = (key: AutoCardKey) => {
    // Don't open if another card is already open
    if (glossaryCardTerm) return
    if (isDebriefOpen) return
    // Skip during tutorial days
    if (tutorialStep !== null) return
    // Skip if not in game
    if (!isGameStarted) return

    const seen = getSeenHints()
    if (seen.has(key)) return

    markSeen(key)
    openGlossaryCard(AUTO_CARD_TERMS[key])
  }

  // Storm warning → radiation card
  useEffect(() => {
    if (stormState === 'warning' && prevStormState.current !== 'warning') {
      tryOpen('storm_radiation')
    }
    prevStormState.current = stormState
  })

  // Scan starts → scan card
  useEffect(() => {
    const isActive = !!activeScan
    if (isActive && !prevScanActive.current) {
      tryOpen('scan')
    }
    prevScanActive.current = isActive
  })

  // Call Earth sent → comms delay card (when it transitions from idle to 'calling')
  useEffect(() => {
    if (callEarthState === 'calling' && prevCallState.current === 'idle') {
      tryOpen('comms_delay')
    }
    prevCallState.current = callEarthState
  })

  // Low battery: when battery drops below 25% capacity for the first time
  useEffect(() => {
    if (batteryCapacity > 0 && battery / batteryCapacity < 0.25 && battery > 0) {
      tryOpen('low_battery')
    }
  }, [battery, batteryCapacity])

  // Sunset warning: when timeLeft first crosses the 20-second threshold
  useEffect(() => {
    const SUNSET_WARN = 20
    if (
      dayPhase === 'sunset' &&
      timeLeft <= SUNSET_WARN &&
      prevTimeLeft.current > SUNSET_WARN
    ) {
      tryOpen('sunset_warning')
    }
    prevTimeLeft.current = timeLeft
  })
}

