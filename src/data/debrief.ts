// Debrief analysis and NASA planner wisdom for Outpost Zero
// Honest, kid-friendly lessons without invented statistics or claims.

import { PlanetId } from '../config/planets'
import { DifficultyId } from '../config/difficulty'
import { StormLevel, SpaceWeatherSource } from './stormSource'
import { PowerSplit } from '../utils/powerRebalance'

export type DayOutcome = 'calm' | 'storm_survived' | 'storm_hurt' | 'stranded' | 'paused'

export interface DayLogEntry {
  day: number
  planet: PlanetId
  difficulty: DifficultyId
  stormLevel: StormLevel
  stormEvents: string[]
  spaceWeatherSource: SpaceWeatherSource
  powerSplit: PowerSplit
  shieldStrength: number
  stormStrength: number
  crewDamage: number
  crewHealthBefore: number
  crewHealthAfter: number
  roverSheltered: boolean | null
  madeItHome: boolean
  airBefore: number
  airAfter: number
  airDrop: number
  discoveriesFound: number
  discoveryPoints: number
  callEarthUsed: boolean
  callEarthTooLate: boolean
  outcome: DayOutcome
}

export interface DebriefInsight {
  title: string
  detail: string
  nasaWisdom?: string
  dayNumber?: number
}

export const NASA_PLANNER_WISDOM = {
  storm_damage:
    'Mission planners check space weather every day and raise shielding before a storm arrives.',
  stranded:
    'Real rover teams plan every drive around battery limits and park safely before sunset.',
  air_loss:
    'Life support teams balance station power carefully so oxygen generators never fall behind consumption.',
  safe_flight:
    'Mission flight controllers review daily logs to balance science objectives with astronaut safety.',
}

export function evaluateBiggestMistake(logs: DayLogEntry[]): DebriefInsight {
  if (!logs || logs.length === 0) {
    return {
      title: 'No big mistakes',
      detail: 'No big mistakes. Nice flying!',
      nasaWisdom: NASA_PLANNER_WISDOM.safe_flight,
    }
  }

  // 1. Day with most crew damage where shield was below storm strength
  let worstStormDay: DayLogEntry | null = null
  let maxStormDamage = 0

  for (const log of logs) {
    if (log.crewDamage > 0 && log.shieldStrength < log.stormStrength) {
      if (log.crewDamage > maxStormDamage) {
        maxStormDamage = log.crewDamage
        worstStormDay = log
      }
    }
  }

  if (worstStormDay) {
    return {
      title: `Day ${worstStormDay.day}: Low Shield During Storm`,
      detail: `On Day ${worstStormDay.day}, the storm hit with strength ${worstStormDay.stormStrength} while your shield was only ${worstStormDay.shieldStrength}%, causing ${worstStormDay.crewDamage}% damage to the crew.`,
      nasaWisdom: NASA_PLANNER_WISDOM.storm_damage,
      dayNumber: worstStormDay.day,
    }
  }

  // 2. A stranded day
  const strandedDay = logs.find((l) => !l.madeItHome && l.outcome === 'stranded')
  if (strandedDay) {
    return {
      title: `Day ${strandedDay.day}: Rover Stranded Overnight`,
      detail: `On Day ${strandedDay.day}, sunset arrived before the rover returned to base. Towing it back cost battery power the next morning.`,
      nasaWisdom: NASA_PLANNER_WISDOM.stranded,
      dayNumber: strandedDay.day,
    }
  }

  // 3. The day Air dropped the most
  let worstAirDay: DayLogEntry | null = null
  let maxAirLoss = 0

  for (const log of logs) {
    const netLoss = log.airBefore - log.airAfter
    if (netLoss > maxAirLoss && netLoss > 2) {
      maxAirLoss = netLoss
      worstAirDay = log
    }
  }

  if (worstAirDay) {
    return {
      title: `Day ${worstAirDay.day}: Air Generator Deficit`,
      detail: `On Day ${worstAirDay.day}, power allocated to the Air Machine was too low, resulting in a net loss of ${maxAirLoss}% breathable air.`,
      nasaWisdom: NASA_PLANNER_WISDOM.air_loss,
      dayNumber: worstAirDay.day,
    }
  }

  // 4. None apply
  return {
    title: 'No big mistakes',
    detail: 'No big mistakes. Nice flying!',
    nasaWisdom: NASA_PLANNER_WISDOM.safe_flight,
  }
}

export function evaluateSmartestMove(logs: DayLogEntry[]): DebriefInsight | null {
  if (!logs || logs.length === 0) return null

  // 1. A storm day where shield blocked all damage
  const perfectShieldDay = logs.find(
    (l) => l.stormStrength > 0 && l.crewDamage === 0 && l.stormLevel !== 'none'
  )
  if (perfectShieldDay) {
    return {
      title: `Day ${perfectShieldDay.day}: Perfect Storm Shielding`,
      detail: `You allocated ${perfectShieldDay.shieldStrength}% shield against a ${perfectShieldDay.stormLevel} storm, completely protecting the astronauts from radiation!`,
      dayNumber: perfectShieldDay.day,
    }
  }

  // 2. The day with highest discovery points
  let bestDiscoveryDay: DayLogEntry | null = null
  let maxPoints = 0

  for (const log of logs) {
    if (log.discoveryPoints > maxPoints) {
      maxPoints = log.discoveryPoints
      bestDiscoveryDay = log
    }
  }

  if (bestDiscoveryDay && maxPoints > 0) {
    return {
      title: `Day ${bestDiscoveryDay.day}: Scientific Breakthrough`,
      detail: `You secured ${maxPoints} scientific discovery points on Day ${bestDiscoveryDay.day}, making a major leap toward the mission goal!`,
      dayNumber: bestDiscoveryDay.day,
    }
  }

  // 3. A day rover reached base just before sunset
  const closeReturnDay = logs.find((l) => l.madeItHome && l.outcome === 'calm')
  if (closeReturnDay) {
    return {
      title: `Day ${closeReturnDay.day}: Safe Return Home`,
      detail: `You drove safely and returned to base on time, keeping rover batteries at full charge.`,
      dayNumber: closeReturnDay.day,
    }
  }

  return null
}

