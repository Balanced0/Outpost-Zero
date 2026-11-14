/**
 * Debug Logger & Error Tracker for Outpost Zero.
 * Captures unhandled errors with full stack traces, active URL flags,
 * texture sizes, renderer details, device diagnostics, live game counts.
 */

export interface TextureInfo {
  key: string
  width: number
  height: number
}

export interface DetailedError {
  id: string
  timestamp: string
  message: string
  stack?: string
}

type Listener = () => void

class DebugLogger {
  public errors: DetailedError[] = []
  public textures: Map<string, TextureInfo> = new Map()
  public rendererType: string = 'Unknown'
  public maxTextureSize: number = 0
  public canvasBackingW: number = 0
  public canvasBackingH: number = 0
  public canvasCssW: number = 0
  public canvasCssH: number = 0
  public hasError: boolean = false
  public isLowQuality: boolean = false

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
      const msg = event.message || (event.error ? String(event.error) : 'Unknown window.onerror')
      const stack = event.error?.stack

      // Intercept Phaser setExtensions or dispatchContextRestored error
      if (msg.includes('setExtensions') || msg.includes('dispatchContextRestored') || (stack && (stack.includes('setExtensions') || stack.includes('dispatchContextRestored')))) {
        console.warn('[DebugLogger] Intercepted Phaser context restore/extensions error:', msg, stack)
        if (!this.handledContextRestoreError) {
          this.handledContextRestoreError = true
          this.logError(`Phaser context restore failure: ${msg}`, stack)
          if (this.onContextErrorFallback) {
            this.onContextErrorFallback()
          }
        }
        return
      }

      this.logError(msg, stack)
    })

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const msg = reason?.message || (typeof reason === 'object' ? JSON.stringify(reason) : String(reason))
      const stack = reason?.stack

      if (msg.includes('setExtensions') || msg.includes('dispatchContextRestored') || (stack && (stack.includes('setExtensions') || stack.includes('dispatchContextRestored')))) {
        console.warn('[DebugLogger] Intercepted Phaser context restore unhandled rejection:', msg, stack)
        if (!this.handledContextRestoreError) {
          this.handledContextRestoreError = true
          this.logError(`Phaser context restore rejection: ${msg}`, stack)
          if (this.onContextErrorFallback) {
            this.onContextErrorFallback()
          }
        }
        return
      }

      this.logError(`[UnhandledRejection] ${msg}`, stack)
    })
  }

  public logError(message: string, stack?: string) {
    const timestamp = new Date().toTimeString().slice(0, 8)
    const entry: DetailedError = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp,
      message,
      stack,
    }

    // Newest first, keep up to 10 full errors
    this.errors.unshift(entry)
    if (this.errors.length > 10) {
      this.errors = this.errors.slice(0, 10)
    }

    this.hasError = true
    this.notify()
    console.error(`[OutpostZero Error] ${message}`, stack || '')
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

  public getActiveFlags(): Record<string, string> {
    if (typeof window === 'undefined') return {}
    const params = new URLSearchParams(window.location.search)
    const flags: Record<string, string> = {}
    params.forEach((val, key) => {
      flags[key] = val
    })
    return flags
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l())
  }
}

// Active game instance reference stored in logger to decouple GameCanvas import
let activeGameInstanceRef: any = null

export function setActiveGame(game: any) {
  activeGameInstanceRef = game
}

export function getActiveGame(): any {
  return activeGameInstanceRef
}

export const debugLogger = new DebugLogger()
