import { addCircle, canvas, engine, Matter } from "./lib.js"

new EventSource('/reload').onmessage = () => location.reload()

engine.gravity.y = 0.15
window.addEventListener('deviceorientation', e => {
  engine.gravity.y = (e.beta ?? 0.15 * 140) / 140
  engine.gravity.x = (e.gamma ?? 0) / 140
}, true)

const aborts = new Map<number, AbortController>()

function addCircles(e: PointerEvent) {
  for (let i = 0; i < 1 * e.pressure ** e.pressure; i++) {
    const size = Math.random() * 30 + 5
    const circle = addCircle(e.clientX, e.clientY, size)
    Matter.Body.setVelocity(circle, { x: e.movementX / 10, y: e.movementY / 10 })
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
