import { DONKI_CONFIG } from '../config/donkiConfig'

export type DonkiLevel = 'none' | 'minor' | 'strong'

export interface DonkiDay {
  date: string // "YYYY-MM-DD"
  level: DonkiLevel
  events: string[]
}

export interface DonkiPayload {
  source: 'live' | 'saved' | 'simulated'
  windowStart: string
  windowEnd: string
  days: DonkiDay[]
}

interface RawFLR {
  classType?: string
  beginTime?: string
  peakTime?: string
}

interface RawGST {
  startTime?: string
  allKpIndex?: { kpIndex: number }[]
}

interface RawSEP {
  eventTime?: string
}

/**
 * Normalizes dates and builds daily space weather classifications.
 */
export function processDonkiEvents(
  flrList: RawFLR[] = [],
  gstList: RawGST[] = [],
  sepList: RawSEP[] = [],
  startDate: string,
  endDate: string
): DonkiDay[] {
  const dailyMap: Record<string, { level: DonkiLevel; events: string[] }> = {}

  // Initialize all days in range
  const curr = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')

  while (curr <= end) {
    const dStr = curr.toISOString().slice(0, 10)
    dailyMap[dStr] = { level: 'none', events: [] }
    curr.setUTCDate(curr.getUTCDate() + 1)
  }

  // 1. Process Solar Flares (FLR)
  for (const flr of flrList) {
    const rawTime = flr.peakTime || flr.beginTime
    if (!rawTime) continue
    const dateStr = rawTime.slice(0, 10)
    if (!dailyMap[dateStr]) continue

    const classType = (flr.classType || '').toUpperCase()
    if (classType.startsWith(DONKI_CONFIG.STRONG_FLARE_CLASS)) {
      dailyMap[dateStr].level = 'strong'
      dailyMap[dateStr].events.push(`${classType} solar flare`)
    } else if (classType.startsWith(DONKI_CONFIG.MINOR_FLARE_CLASS)) {
      if (dailyMap[dateStr].level !== 'strong') {
        dailyMap[dateStr].level = 'minor'
      }
      dailyMap[dateStr].events.push(`${classType} solar flare`)
    }
  }

  // 2. Process Geomagnetic Storms (GST)
  for (const gst of gstList) {
    if (!gst.startTime) continue
    const dateStr = gst.startTime.slice(0, 10)
    if (!dailyMap[dateStr]) continue

    const kpList = (gst.allKpIndex || []).map((k) => k.kpIndex).filter((v) => typeof v === 'number')
    const maxKp = kpList.length > 0 ? Math.max(...kpList) : 0

    if (maxKp >= DONKI_CONFIG.STRONG_GST_KP) {
      dailyMap[dateStr].level = 'strong'
      dailyMap[dateStr].events.push(`Geomagnetic storm (Kp ${maxKp})`)
    } else if (maxKp >= DONKI_CONFIG.MINOR_GST_KP) {
      if (dailyMap[dateStr].level !== 'strong') {
        dailyMap[dateStr].level = 'minor'
      }
      dailyMap[dateStr].events.push(`Geomagnetic storm (Kp ${maxKp})`)
    }
  }

  // 3. Process Solar Energetic Particle Events (SEP)
  for (const sep of sepList) {
    if (!sep.eventTime) continue
    const dateStr = sep.eventTime.slice(0, 10)
    if (!dailyMap[dateStr]) continue

    dailyMap[dateStr].level = 'strong'
    dailyMap[dateStr].events.push('Solar energetic particle (SEP) event')
  }

  // Convert to sorted array
  const sortedDays = Object.keys(dailyMap)
    .sort()
    .map((date) => {
      const entry = dailyMap[date]
      return {
        date,
        level: entry.level,
        events: entry.events.length > 0 ? Array.from(new Set(entry.events)) : ['Quiet space weather'],
      }
    })

  return sortedDays
}

/**
 * Finds the most active 20 consecutive days in a date array.
 */
export function pickMostActive20Days(allDays: DonkiDay[]): {
  windowStart: string
  windowEnd: string
  days: DonkiDay[]
} {
  const windowSize = DONKI_CONFIG.MISSION_DAYS_COUNT

  if (allDays.length <= windowSize) {
    return {
      windowStart: allDays[0]?.date || 'Unknown',
      windowEnd: allDays[allDays.length - 1]?.date || 'Unknown',
      days: allDays,
    }
  }

  let bestIndex = 0
  let maxScore = -1

  for (let i = 0; i <= allDays.length - windowSize; i++) {
    const window = allDays.slice(i, i + windowSize)
    let score = 0
    for (const d of window) {
      if (d.level === 'strong') score += 3
      else if (d.level === 'minor') score += 1
    }
    if (score > maxScore) {
      maxScore = score
      bestIndex = i
    }
  }

  const selectedDays = allDays.slice(bestIndex, bestIndex + windowSize)
  return {
    windowStart: selectedDays[0].date,
    windowEnd: selectedDays[selectedDays.length - 1].date,
    days: selectedDays,
  }
}

