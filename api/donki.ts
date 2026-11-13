import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchLiveDonki } from '../src/services/donkiService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept GET requests
  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = await fetchLiveDonki()
    // Cache header for edge/browser CDN (1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    return res.status(200).json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DONKI error'
    return res.status(502).json({
      error: 'NASA DONKI request failed',
      details: message,
    })
  }
}

