import { addCircle, canvas } from "./lib.js"

new EventSource('/reload').onmessage = () => location.reload()

const aborts = new Map<number, AbortController>()

function addCircles(e: PointerEvent) {
  for (let i = 0; i < 1 * e.pressure ** e.pressure; i++) {
    const size = Math.random() * 30 + 5
    addCircle(e.clientX, e.clientY, 0, 0, size)
    navigator.vibrate(1)
  }
}

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  const abort = new AbortController()
  aborts.set(e.pointerId, abort)

  addCircles(e)
  canvas.addEventListener('pointermove', addCircles, { signal: abort.signal })

  canvas.addEventListener('pointerup', (e) => {
    aborts.get(e.pointerId)!.abort()
  }, { once: true, })
}
