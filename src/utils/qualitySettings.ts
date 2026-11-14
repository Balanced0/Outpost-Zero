/**
 * Quality & Performance Manager for Outpost Zero.
 * Supports low-quality mode for iPads, low-memory devices, or via ?low=1 / localStorage.
 */

const LOW_QUALITY_KEY = 'outpost_zero_low_quality'
export const MAX_CANVAS_PIXELS = 4000000 // 4 million pixels cap to prevent iOS Safari memory crashes

export function isLowQualityMode(): boolean {
  if (typeof window === 'undefined') return false

  // 1. URL parameter override
  const params = new URLSearchParams(window.location.search)
  if (params.get('low') === '1') return true
  if (params.get('low') === '0') return false

  // 2. Local storage preference
  try {
    const saved = localStorage.getItem(LOW_QUALITY_KEY)
    if (saved !== null) return saved === 'true'
  } catch {
    // Ignore localStorage errors
  }

  // 3. Auto-detection based on device memory and CPU cores
  const nav = navigator as unknown as { deviceMemory?: number; hardwareConcurrency?: number }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) {
    return true
  }
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) {
    return true
  }

  return false
}

export function setLowQualityMode(val: boolean) {
  try {
    localStorage.setItem(LOW_QUALITY_KEY, val ? 'true' : 'false')
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Returns rendering DPR: capped at 1 for low-quality mode, at most 2 for normal mode.
 */
export function getEffectiveDpr(): number {
  if (isLowQualityMode()) return 1
  return Math.min(window.devicePixelRatio || 1, 2)
}

/**
 * Calculates canvas buffer dimensions constrained to at most MAX_CANVAS_PIXELS (4M pixels).
 */
export function getClampedCanvasSize(cssW: number, cssH: number): {
  bufferW: number
  bufferH: number
  effectiveDpr: number
} {
  const targetDpr = getEffectiveDpr()
  let bufferW = Math.round(cssW * targetDpr)
  let bufferH = Math.round(cssH * targetDpr)

  const totalPixels = bufferW * bufferH
  if (totalPixels > MAX_CANVAS_PIXELS && totalPixels > 0) {
    const scale = Math.sqrt(MAX_CANVAS_PIXELS / totalPixels)
    bufferW = Math.max(320, Math.round(bufferW * scale))
    bufferH = Math.max(240, Math.round(bufferH * scale))
    return {
      bufferW,
      bufferH,
      effectiveDpr: targetDpr * scale,
    }
  }

  return {
    bufferW,
    bufferH,
    effectiveDpr: targetDpr,
  }
}
