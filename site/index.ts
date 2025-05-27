import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight
window.onresize = () => {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
}

const ctx = canvas.getContext('2d')!
const engine = Matter.Engine.create()

engine.gravity.y = 0.15

const bubbles = new Map<Matter.Body, { color: number, size: number }>()

window.addEventListener('deviceorientation', e => {
  engine.gravity.y = (e.beta ?? 0.15 * 140) / 140
  engine.gravity.x = (e.gamma ?? 0) / 140
}, true)

let rotateHue = 0

run()
function run() {
  requestAnimationFrame(run)

  rotateHue++
  if (rotateHue >= 360) rotateHue = 0

  Matter.Engine.update(engine, 1000 / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    const edge = 200
    if (
      pos.x < -edge ||
      pos.y < -edge ||
      pos.x > canvas.width + edge ||
      pos.y > canvas.height + edge
    ) {
      Matter.Composite.remove(engine.world, b)
      continue
    }

    const info = bubbles.get(b)!
    const size = info.size

    const hue = (info.color + rotateHue) % 360
    const col = (alpha: number) => `hsl(${hue}deg 100% 53.33% / ${alpha})`

    const grad = ctx.createRadialGradient(pos.x, pos.y, size, pos.x + .01, pos.y + .01, 0)
    grad.addColorStop(0, col(1))
    grad.addColorStop(.01, col(1))
    grad.addColorStop(.10, col(.33))
    grad.addColorStop(.40, col(.13))
    grad.addColorStop(.80, col(0))
    grad.addColorStop(.90, '#0000')
    grad.addColorStop(1, '#0000')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
    ctx.fill()

    const grad2 = ctx.createRadialGradient(pos.x, pos.y, size, pos.x + .01, pos.y + .01 - 3, size / 2)
    grad2.addColorStop(0, '#fff7')
    grad2.addColorStop(1, '#0000')
    ctx.fillStyle = grad2
    ctx.beginPath()
    ctx.ellipse(
      pos.x, pos.y - (size * 7 / 20),
      size * 16 / 20, size * 12 / 20,
      0,
      0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fffc'
    ctx.beginPath()
    ctx.ellipse(
      pos.x - (size / 2),
      pos.y - (size / 2),
      size * 1.5 / 20, size * 4 / 20,
      Math.PI / 4,
      0, Math.PI * 2)
    ctx.fill()
  }
}

const aborts = new Map<number, AbortController>()

function addCircle(x: number, y: number, mx: number, my: number, pressure: number) {
  for (let i = 0; i < 1 * pressure ** pressure; i++) {
    const ox = Math.random() * 2 - 1
    const oy = Math.random() * 2 - 1

    const size = Math.random() * 30 + 5

    const circle = Matter.Bodies.circle(x + ox, y + oy, size * (18 / 20))
    Matter.Composite.add(engine.world, circle)

    bubbles.set(circle, ({ color: Math.random() * 360, size }))

    if (mx || my)
      Matter.Body.setVelocity(circle, { x: mx / 10, y: my / 10 })

    navigator.vibrate(1)
  }
}

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
