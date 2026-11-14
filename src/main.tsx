import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { debugLogger } from './utils/debugLogger'

// Initialize global unhandled error handlers immediately for iPad / browser debugging
debugLogger.initGlobalHandlers()

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
