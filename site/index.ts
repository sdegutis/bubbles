import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

const ctx = canvas.getContext('2d')!
const engine = Matter.Engine.create()

engine.gravity.y = 0.15

const colors = new Map<Matter.Body, number>()

// engine.gravity.y = 0
// addCircle(20, 20, 0, 0)

run()
function run() {
  requestAnimationFrame(run)

  Matter.Engine.update(engine, 1000 / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    if (pos.y > canvas.height + 100 || pos.x > canvas.width + 100 || pos.x < -100) {
      Matter.Composite.remove(engine.world, b)
      continue
    }

    const hue = colors.get(b)!
    const col = (alpha: number) => `hsl(${hue}deg 100% 53.33% / ${alpha})`

    const grad = ctx.createRadialGradient(pos.x, pos.y, 20, pos.x + .01, pos.y + .01, 0)
    grad.addColorStop(0, col(1))
    grad.addColorStop(.01, col(1))
    grad.addColorStop(.20, col(.33))
    grad.addColorStop(.40, col(.13))
    grad.addColorStop(.80, col(0))
    grad.addColorStop(.90, '#0000')
    grad.addColorStop(1, '#0000')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2)
    ctx.fill()

    const grad2 = ctx.createRadialGradient(pos.x, pos.y, 20, pos.x + .01, pos.y + .01 - 3, 10)
    grad2.addColorStop(0, '#fff7')
    grad2.addColorStop(1, '#0000')
    ctx.fillStyle = grad2
    ctx.beginPath()
    ctx.ellipse(pos.x, pos.y - 7, 16, 12, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fffc'
    ctx.beginPath()
    ctx.ellipse(pos.x - 10, pos.y - 10, 1.5, 4, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

const aborts = new Map<number, AbortController>()

function addCircle(x: number, y: number, mx: number, my: number, pressure: number) {
  for (let i = 0; i < 1 * pressure ** pressure; i++) {
    const ox = Math.random() * 2 - 1
    const oy = Math.random() * 2 - 1

    const circle = Matter.Bodies.circle(x + ox, y + oy, 15)
    Matter.Composite.add(engine.world, circle)

    colors.set(circle, (Math.random() * 360))

    if (mx || my) Matter.Body.setVelocity(circle, { x: mx / 10, y: my / 10 })

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
