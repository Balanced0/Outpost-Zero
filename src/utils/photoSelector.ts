import photosJson from '../data/photos.json'
import { DiscoveryType } from '../config/balance'
import { PlanetId } from '../config/planets'

export interface NasaPhoto {
  file: string
  planet: 'mars' | 'moon'
  tag: string
  title: string
  credit: string
  sourceUrl: string
}

// Backward-compatible alias
export type MarsPhoto = NasaPhoto

export const allPhotos: NasaPhoto[] = photosJson as NasaPhoto[]

// Keep track of shown photos per planet and category to avoid repeats
const shownHistory: Record<string, string[]> = {}

export function selectPhotoForDiscovery(
  type: DiscoveryType,
  planet: PlanetId = 'mars'
): NasaPhoto | null {
  // Ice is always the drawn illustration on both planets: NO photo, NO credit
  if (type === 'ice') {
    return null
  }

  let eligible: NasaPhoto[] = []

  if (type === 'rock') {
    eligible = allPhotos.filter((p) => p.planet === planet && p.tag === 'rock')
  } else if (type === 'riverbed') {
    if (planet === 'mars') {
      eligible = allPhotos.filter(
        (p) => p.planet === 'mars' && (p.tag === 'layers' || p.tag === 'landscape')
      )
    } else {
      // Moon medium type: landscape or crater
      eligible = allPhotos.filter(
        (p) => p.planet === 'moon' && (p.tag === 'landscape' || p.tag === 'crater')
      )
    }
  }

  if (eligible.length === 0) {
    return null // Trigger drawn illustration fallback
  }

  const historyKey = `${planet}_${type}`
  const shown = shownHistory[historyKey] || []
  let available = eligible.filter((p) => !shown.includes(p.file))

  if (available.length === 0) {
    // Reset cycle when all eligible photos have been shown
    shownHistory[historyKey] = []
    available = eligible
  }

  // Pick random from available
  const picked = available[Math.floor(Math.random() * available.length)]
  if (!shownHistory[historyKey]) {
    shownHistory[historyKey] = []
  }
  shownHistory[historyKey].push(picked.file)

  return picked
}

export function resetPhotoHistory() {
  for (const key of Object.keys(shownHistory)) {
    delete shownHistory[key]
  }
}
