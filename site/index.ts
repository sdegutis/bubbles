import { addCircle, canvas } from "./lib.js"

new EventSource('/reload').onmessage = () => location.reload()

const aborts = new Map<number, AbortController>()

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  addCircle(e.clientX, e.clientY, 0, 0, e.pressure)

  const abort = new AbortController()
  aborts.set(e.pointerId, abort)

  canvas.addEventListener('pointermove', (e) => {
    addCircle(e.clientX, e.clientY, e.movementX, e.movementY, e.pressure)
  }, { signal: abort.signal })

  canvas.addEventListener('pointerup', (e) => {
    aborts.get(e.pointerId)!.abort()
  }, { once: true, })
}
