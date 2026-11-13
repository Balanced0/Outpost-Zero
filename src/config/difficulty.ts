// Difficulty configurations for Outpost Zero
// Important rule: Storms come from real NASA DONKI data, so we don't fake fewer storms.
// Instead, difficulty changes damage multipliers, power budget, comms delays, and hint availability.

export type DifficultyId = 'explorer' | 'commander' | 'mission_control'

export interface DifficultyConfig {
  id: DifficultyId
  name: string
  ageGroup: string
  description: string
  stormDamageMultiplier: number
  hasHints: boolean
  powerBudget: number
  commsDelayMultiplier: number
  badgeColor: string
  discoveryGoal: number // Mission goal in discovery points
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    ageGroup: 'Ages 7 to 9',
    description: 'Gentle damage, friendly hints, and faster radio messages.',
    stormDamageMultiplier: 0.5,
    hasHints: true,
    powerBudget: 100,
    commsDelayMultiplier: 0.5,
    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
    discoveryGoal: 10,
  },
  commander: {
    id: 'commander',
    name: 'Commander',
    ageGroup: 'Ages 10 to 12',
    description: 'Standard NASA challenge. Real damage and honest delays.',
    stormDamageMultiplier: 1.0,
    hasHints: false,
    powerBudget: 100,
    commsDelayMultiplier: 1.0,
    badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
    discoveryGoal: 15,
  },
  mission_control: {
    id: 'mission_control',
    name: 'Mission Control',
    ageGroup: 'Older siblings & parents',
    description: 'Tough 90-power budget, dangerous storms, and long comms delay.',
    stormDamageMultiplier: 1.25,
    hasHints: false,
    powerBudget: 90,
    commsDelayMultiplier: 1.5,
    badgeColor: 'text-purple-300 border-purple-500/40 bg-purple-950/40',
    discoveryGoal: 20,
  },
}
