// Power and Survival Balance Configuration for Outpost Zero
// All game balance formulas and tuning parameters live here.

export const TOTAL_POWER_BUDGET = 100

// Default starting power allocation for morning planning
export const DEFAULT_POWER_SPLIT = {
  air: 34,
  shield: 33,
  rover: 33,
}

// Rover Battery Formula:
// capacity = BASE_ROVER_CAPACITY + (roverPoints * ROVER_CAPACITY_PER_POINT)
// e.g. 0 points -> 40 capacity (tiny battery)
//      33 points -> 73 capacity
//      100 points -> 140 capacity (huge battery)
export const BASE_ROVER_CAPACITY = 40
export const ROVER_CAPACITY_PER_POINT = 1.0

// Air System Formula:
// Initial air: 100%
// Each day, air drops by AIR_DAILY_DROP.
// Air refill = airPoints * AIR_REFILL_MULTIPLIER.
// Net change = refill - AIR_DAILY_DROP.
// At 34 air points: 34 * 0.47 = 15.98 ≈ 16 refill => breaks even with 16 drop.
// At 0 air points: loss of 16% per day => drops to 0 in 6-7 days.
export const INITIAL_AIR = 100
export const AIR_DAILY_DROP = 16
export const AIR_REFILL_MULTIPLIER = 0.47

// Rover battery drain / recharge rates (units/second)
export const BATTERY_DRAIN_DRIVING = 2
export const BATTERY_RECHARGE_BASE = 4

// --- STAGE 4: Solar Storms & Crew Health ---

// Crew Health constants
export const INITIAL_CREW_HEALTH = 100
export const CREW_DAMAGE_MULTIPLIER = 0.5
export const CREW_HEAL_NO_STORM = 5 // Heals +5 on quiet days (max 100)

// Storm schedule odds
export const STORM_ODDS = {
  none: 0.55,
  minor: 0.30,
  strong: 0.15,
}

// Storm intensity strengths
export const STORM_STRENGTHS: Record<'none' | 'minor' | 'strong', number> = {
  none: 0,
  minor: 40,
  strong: 80,
}

// Storm timing parameters
export const STORM_START_MIN_RATIO = 0.25 // Between 25% and 70% of day
export const STORM_START_MAX_RATIO = 0.70
export const STORM_WARNING_SEC = 10 // 10s countdown alert before storm
export const STORM_DURATION_SEC = 15 // Storm duration

// Rover penalty when caught exposed at storm end
export const ROVER_STORM_PENALTY = 30 // Reduced battery capacity next morning
