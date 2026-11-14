import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { debugLogger } from './utils/debugLogger'
import { initSafeCanvas } from './utils/safeCanvas'

// Polyfill safe canvas methods before anything else runs
initSafeCanvas()

// Initialize global unhandled error handlers immediately for iPad / browser debugging
debugLogger.initGlobalHandlers()

// Apply nofx class if ?nofx=1 is present in URL
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search)
  if (params.get('nofx') === '1') {
    document.documentElement.classList.add('nofx')
  }
}

// Dynamically sync --app-h CSS variable with visualViewport / innerHeight for iOS Safari
function updateAppHeight() {
  const h = window.visualViewport?.height ?? window.innerHeight
  if (h > 0) {
    document.documentElement.style.setProperty('--app-h', `${h}px`)
  }
}
updateAppHeight()
window.addEventListener('resize', updateAppHeight)
window.addEventListener('orientationchange', updateAppHeight)
window.visualViewport?.addEventListener('resize', updateAppHeight)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
