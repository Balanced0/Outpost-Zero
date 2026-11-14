/**
 * Debug Logger & Error Tracker for Outpost Zero.
 * Captures unhandled errors, texture sizes, renderer details, device diagnostics,
 * live game instance count, context loss counts, and frame progression.
 * Shown on screen when ?debug=1 is in the URL, or automatically when an error occurs.
 */

export interface TextureInfo {
  key: string
  width: number
  height: number
}

type Listener = () => void

class DebugLogger {
  public errors: string[] = []
  public textures: Map<string, TextureInfo> = new Map()
  public rendererType: string = 'Unknown'
  public maxTextureSize: number = 0
  public canvasBackingW: number = 0
  public canvasBackingH: number = 0
  public canvasCssW: number = 0
  public canvasCssH: number = 0
  public hasError: boolean = false
  public isLowQuality: boolean = false

  // Diagnostics requested by user
  public liveGameCount: number = 0
  public contextLostCount: number = 0
  public fallbackRan: boolean = false
  public frameCount: number = 0

  private handledContextRestoreError: boolean = false
  public onContextErrorFallback?: () => void

  private listeners: Set<Listener> = new Set()
  private initialized: boolean = false

  constructor() {
    this.initGlobalHandlers()
  }

  public initGlobalHandlers() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    window.addEventListener('error', (event: ErrorEvent) => {
      const msg = event.error?.stack || event.message || 'Unknown window.onerror'

      // Catch error thrown from setExtensions or dispatchContextRestored inside Phaser
      if (msg.includes('setExtensions') || msg.includes('dispatchContextRestored')) {
        console.warn('[DebugLogger] Intercepted Phaser context restore/extensions error:', msg)
        if (!this.handledContextRestoreError) {
          this.handledContextRestoreError = true
          this.logError(`Phaser context restore failure: ${msg.split('\n')[0]}`)
          if (this.onContextErrorFallback) {
            this.onContextErrorFallback()
          }
        }
        return
      }

      this.logError(`[Error] ${msg}`)
    })

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg = reason?.stack || (typeof reason === 'object' ? JSON.stringify(reason) : String(reason))
      if (msg.includes('setExtensions') || msg.includes('dispatchContextRestored')) {
        console.warn('[DebugLogger] Intercepted Phaser context restore unhandled rejection:', msg)
        if (!this.handledContextRestoreError) {
          this.handledContextRestoreError = true
          this.logError(`Phaser context restore rejection: ${msg.split('\n')[0]}`)
          if (this.onContextErrorFallback) {
            this.onContextErrorFallback()
          }
        }
        return
      }
      this.logError(`[UnhandledRejection] ${msg}`)
    })
  }

  public logError(message: string) {
    const timestamp = new Date().toTimeString().slice(0, 8)
    const entry = `[${timestamp}] ${message}`
    this.errors.unshift(entry)
    if (this.errors.length > 5) {
      this.errors = this.errors.slice(0, 5)
    }
    this.hasError = true
    this.notify()
    console.error(entry)
  }

  public recordTexture(key: string, width: number, height: number) {
    this.textures.set(key, { key, width, height })
    this.notify()
  }

  public setLiveGameCount(count: number) {
    this.liveGameCount = count
    this.notify()
  }

  public recordContextLost() {
    this.contextLostCount++
    this.notify()
  }

  public setFallbackRan(ran: boolean) {
    this.fallbackRan = ran
    this.notify()
  }

  public incrementFrameCount() {
    this.frameCount++
  }

  public setFrameCount(count: number) {
    this.frameCount = count
  }

  public setRendererInfo(info: {
    type: string
    maxTextureSize?: number
    canvasBackingW?: number
    canvasBackingH?: number
    canvasCssW?: number
    canvasCssH?: number
  }) {
    if (info.type) this.rendererType = info.type
    if (info.maxTextureSize !== undefined) this.maxTextureSize = info.maxTextureSize
    if (info.canvasBackingW !== undefined) this.canvasBackingW = info.canvasBackingW
    if (info.canvasBackingH !== undefined) this.canvasBackingH = info.canvasBackingH
    if (info.canvasCssW !== undefined) this.canvasCssW = info.canvasCssW
    if (info.canvasCssH !== undefined) this.canvasCssH = info.canvasCssH
    this.notify()
  }

  public isDebugActive(): boolean {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    return params.get('debug') === '1' || this.hasError
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }
}

export const debugLogger = new DebugLogger()
