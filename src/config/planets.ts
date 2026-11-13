// Planet configurations for Outpost Zero
// Mars is the baseline; Moon alters visuals and two specific numbers (comms delay and battery drain).

export type PlanetId = 'mars' | 'moon'

export interface PlanetConfig {
  id: PlanetId
  name: string
  tagline: string
  description: string
  realDelayText: string
  gameDelaySec: number // Scaled down for play
  batteryDrainMultiplier: number // Moon is 1.10 (+10% faster due to no convective air cooling)
  hasDustHaze: boolean
  hasAtmosphereDust: boolean
  groundTint: number // Phaser color tint (0xffffff = normal red-orange; 0x909090 = lunar grey)
  badgeColor: string
}

export const PLANETS: Record<PlanetId, PlanetConfig> = {
  mars: {
    id: 'mars',
    name: 'Mars',
    tagline: 'The Red Planet',
    description: 'Red-orange surface, dust storms, and a 20-second radio delay.',
    realDelayText: '4 to 24 real minutes (scaled to 20s for play)',
    gameDelaySec: 20,
    batteryDrainMultiplier: 1.0,
    hasDustHaze: true,
    hasAtmosphereDust: true,
    groundTint: 0xffffff,
    badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-950/40',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    tagline: "Earth's Moon",
    description: 'Grey regolith, fast 2-second radio delay, but battery drains 10% faster (no air to cool it).',
    realDelayText: '~1.3 real seconds (scaled to 2s for play)',
    gameDelaySec: 2,
    batteryDrainMultiplier: 1.1,
    hasDustHaze: false,
    hasAtmosphereDust: false,
    groundTint: 0x8a8a8a, // Grey tint for ground tiles
    badgeColor: 'text-slate-300 border-slate-500/40 bg-slate-900/60',
  },
}

