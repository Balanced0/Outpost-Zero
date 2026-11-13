import { BASE_X, BASE_Y } from '../config/gameConfig'
import {
  DiscoveryType,
  DISCOVERY_COUNTS,
  DISCOVERY_POINTS,
  DISCOVERY_DISTANCES,
  SCAN_BATTERY_COST,
} from '../config/balance'

export interface DiscoverySpot {
  id: string
  type: DiscoveryType
  x: number
  y: number
  distance: number
  points: number
  batteryCost: number
  name: string
  collected: boolean
}

function createRng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function generateDiscoverySpots(seed: number = Math.floor(Math.random() * 1000000)): DiscoverySpot[] {
  const rng = createRng(seed)
  const spots: DiscoverySpot[] = []

  const types: DiscoveryType[] = [
    ...Array(DISCOVERY_COUNTS.rock).fill('rock'),
    ...Array(DISCOVERY_COUNTS.riverbed).fill('riverbed'),
    ...Array(DISCOVERY_COUNTS.ice).fill('ice'),
  ]

  let idCounter = 1

  for (const type of types) {
    const range = DISCOVERY_DISTANCES[type]
    let placed = false
    let attempts = 0

    while (!placed && attempts < 100) {
      attempts++
      const angle = rng() * Math.PI * 2
      const dist = range.min + rng() * (range.max - range.min)
      const x = Math.round(BASE_X + dist * Math.cos(angle))
      const y = Math.round(BASE_Y + dist * Math.sin(angle))

      // Keep inside 4000x4000 world with 100px padding
      if (x < 100 || x > 3900 || y < 100 || y > 3900) continue

      // Minimum separation between spots (140m)
      const tooClose = spots.some((s) => {
        const dx = s.x - x
        const dy = s.y - y
        return Math.sqrt(dx * dx + dy * dy) < 140
      })

      if (!tooClose) {
        const name =
          type === 'rock'
            ? `Rock Sample #${idCounter}`
            : type === 'riverbed'
            ? `Ancient Riverbed #${idCounter}`
            : `Ice Deposit #${idCounter}`

        spots.push({
          id: `spot-${idCounter}`,
          type,
          x,
          y,
          distance: Math.round(dist),
          points: DISCOVERY_POINTS[type],
          batteryCost: SCAN_BATTERY_COST[type],
          name,
          collected: false,
        })
        placed = true
        idCounter++
      }
    }
  }

  return spots
}
