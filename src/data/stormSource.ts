import { STORM_ODDS } from '../config/balance'
import donkiArchiveJson from './donkiArchive.json'
import { DonkiDay, DonkiPayload } from '../utils/donkiProcessor'

export type StormLevel = 'none' | 'minor' | 'strong'
export type SpaceWeatherSource = 'live' | 'saved' | 'simulated'

export interface StormReport {
  level: StormLevel
  source: SpaceWeatherSource
  date: string
  events: string[]
}

// Pseudo-random generator for the simulated fallback
function createRng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Creates simulated 20-day schedule with the guaranteed early storm (days 3-6).
 * Only used as the final fallback if live API and saved archive both fail.
 */
export function generateSimulatedDays(seed: number = Math.floor(Math.random() * 1000000)): DonkiDay[] {
  const rng = createRng(seed)
  const days: DonkiDay[] = []

  for (let i = 1; i <= 20; i++) {
    const roll = rng()
    let level: StormLevel = 'none'
    let events = ['Quiet space weather']

    if (roll < STORM_ODDS.none) {
      level = 'none'
    } else if (roll < STORM_ODDS.none + STORM_ODDS.minor) {
      level = 'minor'
      events = ['Minor solar disturbance']
    } else {
      level = 'strong'
      events = ['Strong solar storm']
    }

    days.push({
      date: `Simulated Day ${i}`,
      level,
      events,
    })
  }

  // Guarantee early storm in days 3 to 6
  const earlyIndices = [2, 3, 4, 5]
  const hasEarly = earlyIndices.some((idx) => days[idx].level !== 'none')
  if (!hasEarly) {
    const pick = earlyIndices[Math.floor(rng() * earlyIndices.length)]
    days[pick].level = 'minor'
    days[pick].events = ['Minor solar radiation burst']
  }

  return days
}

/**
 * Fetches mission space weather following the exact fallback order:
 * 1. Live NASA DONKI via /api/donki
 * 2. Saved real NASA data (donkiArchive.json)
 * 3. Seeded simulation fallback
 */
export async function fetchMissionSpaceWeather(): Promise<DonkiPayload> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8-second timeout

  try {
    const res = await fetch('/api/donki', { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`)
    }
    const data = await res.json()
    if (!data.days || !Array.isArray(data.days) || data.days.length < 20) {
      throw new Error('Invalid live DONKI response format')
    }

    return {
      source: 'live',
      windowStart: data.windowStart || data.days[0].date,
      windowEnd: data.windowEnd || data.days[data.days.length - 1].date,
      days: data.days.slice(0, 20),
    }
  } catch (err) {
    console.warn('Live NASA DONKI unavailable; falling back to saved real archive:', err)

    // Fallback 1: Saved real NASA archive
    try {
      const archive = donkiArchiveJson as DonkiPayload
      if (archive && archive.days && archive.days.length >= 20) {
        return {
          source: 'saved',
          windowStart: archive.windowStart,
          windowEnd: archive.windowEnd,
          days: archive.days.slice(0, 20),
        }
      }
    } catch (archiveErr) {
      console.warn('Saved archive unavailable; falling back to simulation:', archiveErr)
    }

    // Fallback 2: Simulated fallback
    const simDays = generateSimulatedDays()
    return {
      source: 'simulated',
      windowStart: 'Simulated Sol 1',
      windowEnd: 'Simulated Sol 20',
      days: simDays,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Returns space weather storm forecast for the specified day.
 */
export function getStormForDay(
  day: number,
  missionWeather?: DonkiPayload | null
): StormReport {
  const dayIndex = Math.max(0, Math.min(19, day - 1))

  if (missionWeather && missionWeather.days && missionWeather.days[dayIndex]) {
    const dayData = missionWeather.days[dayIndex]
    return {
      level: dayData.level,
      source: missionWeather.source,
      date: dayData.date,
      events: dayData.events,
    }
  }

  // Default to saved archive if store has not loaded yet
  const archive = donkiArchiveJson as DonkiPayload
  const dayData = archive.days[dayIndex]
  return {
    level: dayData?.level || 'none',
    source: 'saved',
    date: dayData?.date || '2024-05-01',
    events: dayData?.events || ['Quiet space weather'],
  }
}
