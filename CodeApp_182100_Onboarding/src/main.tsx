import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initViewport, disposeViewport } from './scale/scaleToFit'
import PowerProvider from './PowerProvider.tsx'

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </StrictMode>,
)

// initialize viewport scaling (designWidth 1280, aspect 16:9, lock to landscape)
initViewport({ designWidth: 1200, aspectRatio: 1200 / 800, orientation: 'landscape', scaleToFit: true })

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeViewport()
  })
}
