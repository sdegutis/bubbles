import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement
setTimeout(() => {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
})

const engine = Matter.Engine.create()

engine.gravity.y = 0.2

const render = Matter.Render.create({
  canvas,
  engine,
})

const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true, isSensor: true })

const bubbles: Matter.Body[] = []

Matter.Composite.add(engine.world, ground)

Matter.Render.run(render)

ontick(d => {
  Matter.Engine.update(engine, 1000 / 60)

  for (const b of bubbles) {
    if (Matter.Collision.collides(ground, b)?.collided) {
      Matter.Composite.remove(engine.world, b)
    }
  }
}, 60)

canvas.onmousedown = e => {
  const circle = Matter.Bodies.circle(e.clientX, e.clientY, 20)
  bubbles.push(circle)
  Matter.Composite.add(engine.world, [circle])
  canvas.onmousemove = e => {
    const circle = Matter.Bodies.circle(e.clientX, e.clientY, 20)
    bubbles.push(circle)
    Matter.Composite.add(engine.world, [circle])
  }
  canvas.onmouseup = () => {
    canvas.onmousemove = null
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
