export type ScaleOptions = {
  designWidth?: number // pixels, base width of your design
  aspectRatio?: number // width / height, e.g. 16/9 -> 1.777
  orientation?: 'portrait' | 'landscape' | 'any'
  scaleToFit?: boolean
}

let _opts: Required<ScaleOptions>
let _resizeHandler: () => void

function applyTransform(el: HTMLElement, scale: number, rotateDeg = 0) {
  // We only apply scale and rotation. Centering is handled by the wrapper's flexbox.
  el.style.transform = `scale(${scale}) rotate(${rotateDeg}deg)`
}

function computeScale(containerW: number, containerH: number, designW: number, designH: number) {
  return Math.min(containerW / designW, containerH / designH)
}

export function initViewport(options?: ScaleOptions) {
  const defaults: Required<ScaleOptions> = {
    designWidth: 1280,
    aspectRatio: 1280 / 768,
    orientation: 'any',
    scaleToFit: true,
  }

  _opts = { ...defaults, ...(options || {}) }

  const wrapper = document.getElementById('viewport-wrapper')!
  const viewport = document.getElementById('viewport')!
  if (!wrapper || !viewport) return

  const designW = _opts.designWidth
  const designH = Math.round(designW / _opts.aspectRatio)

  // size the viewport element to the design size (CSS should center it)
  viewport.style.width = `${designW}px`
  viewport.style.height = `${designH}px`

  function resize() {
  const cw = wrapper!.clientWidth || window.innerWidth
  const ch = wrapper!.clientHeight || window.innerHeight

    let rotate = 0
    // visual orientation lock: if orientation is portrait but container is landscape, rotate the viewport
    if (_opts.orientation === 'portrait' && cw > ch) rotate = 90
    if (_opts.orientation === 'landscape' && ch > cw) rotate = 90

    // If rotated, swap available width/height
    const availableW = rotate === 90 ? ch : cw
    const availableH = rotate === 90 ? cw : ch

    const scale = _opts.scaleToFit ? computeScale(availableW, availableH, designW, designH) : 1

    // apply transform: center with translate(-50%,-50%), then scale and rotate
  applyTransform(viewport!, scale, rotate)

    // keep wrapper height to avoid layout jumps
  wrapper!.style.height = `${Math.round(designH * scale)}px`
  }

  _resizeHandler = resize
  window.addEventListener('resize', _resizeHandler)
  // initial
  resize()
}

export function disposeViewport() {
  if (_resizeHandler) window.removeEventListener('resize', _resizeHandler)
}
