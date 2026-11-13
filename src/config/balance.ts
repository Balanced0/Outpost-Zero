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

// --- STAGE 6: Discoveries & Scanning Balance ---

export type DiscoveryType = 'rock' | 'riverbed' | 'ice'

export const DISCOVERY_TOTAL_SPOTS = 12

// Distribution counts among the 12 spots
export const DISCOVERY_COUNTS: Record<DiscoveryType, number> = {
  rock: 5,
  riverbed: 4,
  ice: 3,
}

// Point values
export const DISCOVERY_POINTS: Record<DiscoveryType, number> = {
  rock: 1,
  riverbed: 2,
  ice: 4,
}

// Distance ranges from base (meters)
export const DISCOVERY_DISTANCES: Record<DiscoveryType, { min: number; max: number }> = {
  rock: { min: 300, max: 900 },
  riverbed: { min: 900, max: 1600 },
  ice: { min: 1600, max: 1920 },
}

// Scanning parameters
export const SCAN_PROXIMITY_RADIUS = 60 // Must be within 60m of spot to scan
export const SCAN_DURATION_SEC = 3.0 // 3 seconds to complete scan

// Battery cost to execute scan
export const SCAN_BATTERY_COST: Record<DiscoveryType, number> = {
  rock: 8,
  riverbed: 12,
  ice: 15,
}

// Battery cost to transmit message to Earth (Stage 7A)
export const CALL_EARTH_BATTERY_COST = 5

// --- STAGE 7B: Stars and Debrief Thresholds ---
export const STAR_SURVIVAL_DAYS = 20
export const STAR3_MIN_CREW_HEALTH = 60
export const STAR3_MIN_AIR = 40
