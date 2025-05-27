import Matter from 'matter-js'

new EventSource('/reload').onmessage = () => location.reload()

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const engine = Matter.Engine.create()

const render = Matter.Render.create({
  canvas,
  engine,
})

const boxA = Matter.Bodies.rectangle(400, 200, 80, 80)
const boxB = Matter.Bodies.rectangle(450, 50, 80, 80)
const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true })

Matter.Composite.add(engine.world, [boxA, boxB, ground])

Matter.Render.run(render)

const runner = Matter.Runner.create()

Matter.Runner.run(runner, engine)
