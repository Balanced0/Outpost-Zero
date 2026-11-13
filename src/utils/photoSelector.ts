import marsPhotosJson from '../data/marsPhotos.json'
import { DiscoveryType } from '../config/balance'

export interface MarsPhoto {
  file: string
  tag: string
  title: string
  credit: string
  sourceUrl: string
}

const allPhotos: MarsPhoto[] = marsPhotosJson as MarsPhoto[]

// Keep track of shown photos per category to avoid repeats
const shownHistory: Record<string, string[]> = {
  rock: [],
  riverbed: [],
  ice: [],
}

export function selectPhotoForDiscovery(type: DiscoveryType): MarsPhoto | null {
  let eligible: MarsPhoto[] = []

  if (type === 'rock') {
    eligible = allPhotos.filter((p) => p.tag === 'rock')
  } else if (type === 'riverbed') {
    eligible = allPhotos.filter((p) => p.tag === 'layers' || p.tag === 'landscape')
  } else if (type === 'ice') {
    // ONLY photos tagged 'ice'
    eligible = allPhotos.filter((p) => p.tag === 'ice')
  }

  if (eligible.length === 0) {
    return null // Trigger drawn illustration fallback (especially for ice)
  }

  // Filter out recently shown
  const shown = shownHistory[type] || []
  let available = eligible.filter((p) => !shown.includes(p.file))

  if (available.length === 0) {
    // Reset cycle
    shownHistory[type] = []
    available = eligible
  }

  // Pick random from available
  const picked = available[Math.floor(Math.random() * available.length)]
  shownHistory[type].push(picked.file)

  return picked
}

export function resetPhotoHistory() {
  shownHistory.rock = []
  shownHistory.riverbed = []
  shownHistory.ice = []
}

