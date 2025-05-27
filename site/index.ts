import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

const ctx = canvas.getContext('2d')!
const engine = Matter.Engine.create()

engine.gravity.y = 0.15



const circle = Matter.Bodies.circle(20, 20, 15)
Matter.Composite.add(engine.world, [circle])
engine.gravity.y = 0



run()
function run() {
  requestAnimationFrame(run)

  Matter.Engine.update(engine, 1000 / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    if (pos.y > canvas.height + 100) {
      Matter.Composite.remove(engine.world, b)
      continue
    }

    const grad = ctx.createRadialGradient(pos.x, pos.y, 20, pos.x + .01, pos.y + .01, 0)
    grad.addColorStop(0, '#19ff')
    grad.addColorStop(.01, '#19ff')
    grad.addColorStop(.20, '#19f5')
    grad.addColorStop(.40, '#19f2')
    grad.addColorStop(.80, '#19f0')
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

    ctx.fillStyle = '#fff9'
    ctx.beginPath()
    ctx.ellipse(pos.x - 10, pos.y - 10, 1.5, 4, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

const aborts = new Map<number, AbortController>()

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  const circle = Matter.Bodies.circle(e.clientX, e.clientY, 15)
  Matter.Composite.add(engine.world, [circle])

  const abort = new AbortController()
  aborts.set(e.pointerId, abort)

  canvas.addEventListener('pointermove', (e) => {
    const circle = Matter.Bodies.circle(e.clientX, e.clientY, 15)
    Matter.Composite.add(engine.world, [circle])
    const factor = 10
    Matter.Body.setVelocity(circle, { x: e.movementX / factor, y: e.movementY / factor })
  }, { signal: abort.signal })

  canvas.addEventListener('pointerup', (e) => {
    aborts.get(e.pointerId)!.abort()
  }, { once: true, })
}
