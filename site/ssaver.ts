import { addCircle, canvas, clearAll } from "./lib.js"

const sec = +(new URL(import.meta.url).searchParams.get('sec') ?? '10')

new EventSource('/reload').onmessage = () => location.reload()

let timeout: ReturnType<typeof setInterval>

const restartIdleTimer = () => {
  canvas.style.display = 'none'
  clearAll()
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    canvas.style.display = 'block'
    timeout = setInterval(addBubbles, 100)
  }, sec * 1000)
}
restartIdleTimer()

canvas.style.pointerEvents = 'none'
document.addEventListener('pointermove', restartIdleTimer, { passive: true })
document.addEventListener('pointerdown', restartIdleTimer, { passive: true })
document.addEventListener('keydown', restartIdleTimer, { passive: true })
document.addEventListener('wheel', restartIdleTimer, { passive: true })

function addBubbles() {
  const x = Math.random() * canvas.width
  const y = Math.random() * canvas.height

  const d = 20
  const mx = Math.random() * (d * 2) - d
  const my = Math.random() * (d * 2) - d

  const size = Math.random() * 10 + 20

  addCircle(x, y, mx, my, size)
}
