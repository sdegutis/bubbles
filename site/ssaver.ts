import { addCircle, canvas, clearAll, engine, Matter } from "./lib.js"

engine.gravity.y = 0

const params = new URL(import.meta.url).searchParams
const delay = +(params.get('delay') ?? '60')
const speed = +(params.get('speed') ?? '2')
const interval = +(params.get('interval') ?? '100')
const min = +(params.get('minsize') ?? '10')
const max = +(params.get('maxsize') ?? '40')

let timeout: ReturnType<typeof setInterval>

const restartIdleTimer = () => {
  canvas.style.display = 'none'
  clearAll()
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    canvas.style.display = 'block'
    timeout = setInterval(addBubbles, interval)
  }, delay * 1000)
}
restartIdleTimer()

canvas.style.pointerEvents = 'none'
document.addEventListener('pointermove', restartIdleTimer, { passive: true })
document.addEventListener('pointerdown', restartIdleTimer, { passive: true })
document.addEventListener('keydown', restartIdleTimer, { passive: true })
document.addEventListener('wheel', restartIdleTimer, { passive: true })

function addBubbles() {
  const x = -10
  const y = canvas.height + 10

  const mx = Math.random() * +speed
  const my = Math.random() * -speed

  const size = Math.random() * (max - min) + min

  const circle = addCircle(x, y, size)
  circle.frictionAir = 0
  Matter.Body.setVelocity(circle, { x: mx, y: my })
}
