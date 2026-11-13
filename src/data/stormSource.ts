import { STORM_ODDS } from '../config/balance'

export type StormLevel = 'none' | 'minor' | 'strong'

export interface StormReport {
  level: StormLevel
  source: 'simulated' | 'nasa-donki'
}

// Pseudo-random generator with a seed
function createRng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Mission storm schedule cache for days 1 to 20
let currentMissionSeed = Math.floor(Math.random() * 1000000)
let scheduleCache: Record<number, StormLevel> = {}

export function resetStormSchedule(newSeed?: number) {
  currentMissionSeed = newSeed ?? Math.floor(Math.random() * 1000000)
  scheduleCache = generateSchedule(currentMissionSeed)
}

function generateSchedule(seed: number): Record<number, StormLevel> {
  const rng = createRng(seed)
  const schedule: Record<number, StormLevel> = {}

  for (let day = 1; day <= 20; day++) {
    const roll = rng()
    let level: StormLevel = 'none'
    if (roll < STORM_ODDS.none) {
      level = 'none'
    } else if (roll < STORM_ODDS.none + STORM_ODDS.minor) {
      level = 'minor'
    } else {
      level = 'strong'
    }
    schedule[day] = level
  }

  // Guarantee at least one minor or strong storm in days 3 to 6
  const earlyDays = [3, 4, 5, 6]
  const hasEarlyStorm = earlyDays.some((d) => schedule[d] !== 'none')
  if (!hasEarlyStorm) {
    const pickDay = earlyDays[Math.floor(rng() * earlyDays.length)]
    schedule[pickDay] = 'minor'
  }

  return schedule
}

// Ensure initial schedule is populated
if (Object.keys(scheduleCache).length === 0) {
  scheduleCache = generateSchedule(currentMissionSeed)
}

/**
 * Returns space weather storm forecast for the specified day.
 * Stage 5 will swap the internal body of this function with real NASA DONKI calls.
 */
export function getStormForDay(day: number): StormReport {
  if (!scheduleCache[day]) {
    // Fallback if day > 20
    scheduleCache = generateSchedule(currentMissionSeed)
  }

  const level = scheduleCache[day] || 'none'
  return {
    level,
    source: 'simulated',
  }
}

