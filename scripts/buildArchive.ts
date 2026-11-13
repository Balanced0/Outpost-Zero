import fs from 'fs'
import path from 'path'
import { processDonkiEvents, pickMostActive20Days, DonkiPayload } from '../src/utils/donkiProcessor'

/**
 * Fetches real historical NASA DONKI space weather data (May 2024 solar storms)
 * and generates src/data/donkiArchive.json.
 */
async function buildArchive() {
  console.log('Fetching real NASA DONKI archive for May 2024 solar storm period...')

  // May 2024 had historic G5 geomagnetic storms and severe X-class flares
  const startDate = '2024-05-01'
  const endDate = '2024-05-20'

  const baseUrl = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get'

  try {
    const [flrRes, gstRes, sepRes] = await Promise.all([
      fetch(`${baseUrl}/FLR?startDate=${startDate}&endDate=${endDate}`),
      fetch(`${baseUrl}/GST?startDate=${startDate}&endDate=${endDate}`),
      fetch(`${baseUrl}/SEP?startDate=${startDate}&endDate=${endDate}`),
    ])

    if (!flrRes.ok || !gstRes.ok || !sepRes.ok) {
      throw new Error(`Failed to fetch from DONKI API: FLR ${flrRes.status}, GST ${gstRes.status}, SEP ${sepRes.status}`)
    }

    const flrData = await flrRes.json()
    const gstData = await gstRes.json()
    const sepData = await sepRes.json()

    console.log(`Fetched ${flrData.length} flares, ${gstData.length} geomagnetic storms, and ${sepData.length} SEP events.`)

    const processedDays = processDonkiEvents(flrData, gstData, sepData, startDate, endDate)
    const { windowStart, windowEnd, days } = pickMostActive20Days(processedDays)

    const payload: DonkiPayload = {
      source: 'saved',
      windowStart,
      windowEnd,
      days,
    }

    const outPath = path.resolve(process.cwd(), 'src/data/donkiArchive.json')
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8')
    console.log(`Successfully generated real NASA archive at: ${outPath}`)
    console.log(`Window: ${windowStart} to ${windowEnd} (${days.length} days)`)
  } catch (err) {
    console.error('Error building DONKI archive:', err)
    process.exit(1)
  }
}

buildArchive()

