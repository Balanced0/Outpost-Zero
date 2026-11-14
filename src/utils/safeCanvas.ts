/**
 * Safe Canvas & Context Polyfill for iPad Safari.
 * Guards against WebKit getImageData / putImageData crashes when canvas size is 0 or allocation fails.
 */

export function initSafeCanvas() {
  if (typeof window === 'undefined') return

  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData

    CanvasRenderingContext2D.prototype.getImageData = function (
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      settings?: ImageDataSettings
    ): ImageData {
      // Guard against zero/negative dimensions
      const safeW = Math.max(1, Math.floor(sw || 1))
      const safeH = Math.max(1, Math.floor(sh || 1))

      try {
        if (sw <= 0 || sh <= 0) {
          console.warn(`[SafeCanvas] Intercepted zero-size getImageData(${sx}, ${sy}, ${sw}, ${sh})`)
          return this.createImageData(safeW, safeH)
        }
        return originalGetImageData.call(this, sx, sy, sw, sh, settings)
      } catch (err) {
        console.warn(`[SafeCanvas] getImageData(${sx}, ${sy}, ${sw}, ${sh}) failed, using fallback ImageData:`, err)
        try {
          return this.createImageData(safeW, safeH)
        } catch {
          // Absolute fallback if createImageData also fails
          const dummyData = new Uint8ClampedArray(safeW * safeH * 4)
          return new ImageData(dummyData, safeW, safeH)
        }
      }
    }

    const originalPutImageData = CanvasRenderingContext2D.prototype.putImageData
    CanvasRenderingContext2D.prototype.putImageData = function (
      imagedata: ImageData,
      dx: number,
      dy: number,
      ...args: any[]
    ): void {
      try {
        if (!imagedata || imagedata.width <= 0 || imagedata.height <= 0) {
          return
        }
        // @ts-ignore
        originalPutImageData.call(this, imagedata, dx, dy, ...args)
      } catch (err) {
        console.warn('[SafeCanvas] putImageData failed:', err)
      }
    }
  }
}
