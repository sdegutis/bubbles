import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const engine = Matter.Engine.create()

// engine.gravity.y = 0

const render = Matter.Render.create({
  canvas,
  engine,
})

const resize = () => {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
}

resize()
window.onresize = resize

const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true, isSensor: true })



Matter.Composite.add(engine.world, ground)

Matter.Render.run(render)

const runner = Matter.Runner.create()

Matter.Runner.run(runner, engine)

canvas.onmousedown = e => {
  const circle = Matter.Bodies.circle(e.clientX, e.clientY, 40)
  Matter.Composite.add(engine.world, [circle])
}
