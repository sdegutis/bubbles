import { addCircle, canvas } from "./lib.js"

new EventSource('/reload').onmessage = () => location.reload()

const aborts = new Map<number, AbortController>()

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  for (let i = 0; i < 1 * e.pressure ** e.pressure; i++) {
    addCircle(e.clientX, e.clientY, 0, 0)
  }

  const abort = new AbortController()
  aborts.set(e.pointerId, abort)

  canvas.addEventListener('pointermove', (e) => {
    for (let i = 0; i < 1 * e.pressure ** e.pressure; i++) {
      addCircle(e.clientX, e.clientY, e.movementX, e.movementY)
    }
  }, { signal: abort.signal })

  canvas.addEventListener('pointerup', (e) => {
    aborts.get(e.pointerId)!.abort()
  }, { once: true, })
}
