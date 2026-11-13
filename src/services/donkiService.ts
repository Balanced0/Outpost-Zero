import { DONKI_CONFIG } from '../config/donkiConfig'
import { processDonkiEvents, pickMostActive20Days, DonkiPayload } from '../utils/donkiProcessor'

let cachedPayload: DonkiPayload | null = null
let cachedAt = 0

/**
 * Fetches real space weather from NASA DONKI for the last 60 days
 * and selects the most active 20-day consecutive mission window.
 */
export async function fetchLiveDonki(apiKey?: string): Promise<DonkiPayload> {
  // Check in-memory cache
  if (cachedPayload && Date.now() - cachedAt < DONKI_CONFIG.CACHE_TTL_MS) {
    return cachedPayload
  }

  const now = new Date()
  const endDate = now.toISOString().slice(0, 10)
  const past = new Date(now.getTime() - DONKI_CONFIG.LOOKBACK_DAYS * 24 * 3600 * 1000)
  const startDate = past.toISOString().slice(0, 10)

  const effectiveKey = apiKey || process.env.NASA_API_KEY || 'DEMO_KEY'

  // Timeout controller for 8 seconds
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DONKI_CONFIG.REQUEST_TIMEOUT_MS)

  try {
    let flrRes: Response
    let gstRes: Response
    let sepRes: Response

    // 1. Try primary API base (api.nasa.gov) with key
    const primaryUrl = `${DONKI_CONFIG.PRIMARY_API_BASE}`
    try {
      const results = await Promise.all([
        fetch(`${primaryUrl}/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${effectiveKey}`, {
          signal: controller.signal,
        }),
        fetch(`${primaryUrl}/GST?startDate=${startDate}&endDate=${endDate}&api_key=${effectiveKey}`, {
          signal: controller.signal,
        }),
        fetch(`${primaryUrl}/SEP?startDate=${startDate}&endDate=${endDate}&api_key=${effectiveKey}`, {
          signal: controller.signal,
        }),
      ])
      flrRes = results[0]
      gstRes = results[1]
      sepRes = results[2]
    } catch {
      flrRes = { ok: false, status: 500 } as Response
      gstRes = { ok: false, status: 500 } as Response
      sepRes = { ok: false, status: 500 } as Response
    }

    // 2. If primary fails or 404s (NASA DONKI migration), use CCMC DONKI endpoint
    if (!flrRes.ok || !gstRes.ok || !sepRes.ok) {
      const fallbackUrl = DONKI_CONFIG.FALLBACK_API_BASE
      const fallbackResults = await Promise.all([
        fetch(`${fallbackUrl}/FLR?startDate=${startDate}&endDate=${endDate}`, { signal: controller.signal }),
        fetch(`${fallbackUrl}/GST?startDate=${startDate}&endDate=${endDate}`, { signal: controller.signal }),
        fetch(`${fallbackUrl}/SEP?startDate=${startDate}&endDate=${endDate}`, { signal: controller.signal }),
      ])
      flrRes = fallbackResults[0]
      gstRes = fallbackResults[1]
      sepRes = fallbackResults[2]
    }

    if (!flrRes.ok || !gstRes.ok || !sepRes.ok) {
      throw new Error(`NASA DONKI endpoint error: FLR ${flrRes.status}, GST ${gstRes.status}, SEP ${sepRes.status}`)
    }

    const flrData = await flrRes.json()
    const gstData = await gstRes.json()
    const sepData = await sepRes.json()

    if (!Array.isArray(flrData) || !Array.isArray(gstData) || !Array.isArray(sepData)) {
      throw new Error('Invalid JSON array response from NASA DONKI')
    }

    const processedDays = processDonkiEvents(flrData, gstData, sepData, startDate, endDate)
    const { windowStart, windowEnd, days } = pickMostActive20Days(processedDays)

    const payload: DonkiPayload = {
      source: 'live',
      windowStart,
      windowEnd,
      days,
    }

    cachedPayload = payload
    cachedAt = Date.now()

    return payload
  } finally {
    clearTimeout(timeoutId)
  }
}

