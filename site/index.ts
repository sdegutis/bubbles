import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
setTimeout(() => {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
})

const ctx = canvas.getContext('2d')!

const engine = Matter.Engine.create()

engine.gravity.y = 0.15

ontick(d => {
  Matter.Engine.update(engine, 1000 / 60)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    if (pos.y > canvas.height + 100) {
      Matter.Composite.remove(engine.world, b)
      continue
    }

    const grad = ctx.createRadialGradient(pos.x, pos.y, 20, pos.x + .1, pos.y + .1, 0)

    grad.addColorStop(0, '#9009')
    grad.addColorStop(1, '#0000')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2)
    ctx.fill()
  }
}, 60)

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  const circle = Matter.Bodies.circle(e.clientX, e.clientY, 20)
  Matter.Composite.add(engine.world, [circle])

  canvas.onpointermove = e => {
    const circle = Matter.Bodies.circle(e.clientX, e.clientY, 20)
    Matter.Composite.add(engine.world, [circle])
    const factor = 10
    Matter.Body.setVelocity(circle, { x: e.movementX / factor, y: e.movementY / factor })

    canvas.onpointerup = e => {
      canvas.onpointermove = null
    }
  }
}

function ontick(fn: (d: number) => void, fps = 30) {
  let done: number
  let last = performance.now();

  (function tick(now: number) {

    const delta = now - last
    if (delta + 1 >= 1000 / fps) {
      last = now
      fn(delta)
    }

    done = requestAnimationFrame(tick)
  })(last)

  return () => cancelAnimationFrame(done)
}
