import './instrument.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  console.error('Root element #root not found')
} else {
  const rootOptions = typeof Sentry.reactErrorHandler === 'function'
    ? {
        onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
          console.warn('Uncaught error', error, errorInfo?.componentStack)
        }),
        onCaughtError: Sentry.reactErrorHandler(),
        onRecoverableError: Sentry.reactErrorHandler(),
      }
    : undefined

  try {
    const root = createRoot(rootEl, rootOptions)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    console.error('App failed to mount:', err)
    rootEl.innerHTML = [
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;font-family:system-ui,sans-serif;text-align:center;">',
      '<h1 style="font-size:1.5rem;margin:0 0 12px;">Something went wrong</h1>',
      '<p style="color:#64748b;margin:0 0 20px;">Check the browser console for details.</p>',
      '<button onclick="location.reload()" style="padding:10px 20px;background:#064E3B;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Reload</button>',
      '</div>',
    ].join('')
  }
}
