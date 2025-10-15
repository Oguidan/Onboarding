// A small postMessage-based bridge to receive context from the hosting Power Apps Canvas
// The hosting Canvas app should post a message to the iframe with { type: 'powerapps-context', payload: { userId, baseUrl, token } }

export type PowerAppsBridgePayload = {
  userId?: string;
  baseUrl?: string; // optional base url for Dataverse / API
  token?: string; // optional bearer token if you plan to call Dataverse directly
  [key: string]: any;
}

type Listener = (payload: PowerAppsBridgePayload) => void

const listeners: Listener[] = []

export function initPowerAppsBridge() {
  function onMessage(e: MessageEvent) {
    // Optionally scope by origin check in production
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      if (data && data.type === 'powerapps-context') {
        const payload: PowerAppsBridgePayload = data.payload || {}
        listeners.forEach((l) => l(payload))
      }
    } catch {
      // ignore non-json messages
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('message', onMessage)
  }
}

export function onPowerAppsContext(listener: Listener) {
  listeners.push(listener)
  return () => {
    const idx = listeners.indexOf(listener)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}

export function postToPowerApps(message: any) {
  if (typeof window !== 'undefined' && window.parent) {
    window.parent.postMessage(JSON.stringify(message), '*')
  }
}
