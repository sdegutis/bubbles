import Matter from 'matter-js'

export { Matter }
export const canvas = document.createElement('canvas')

canvas.style.position = 'fixed'
canvas.style.inset = '0 0'
canvas.style.zIndex = '1000000'

canvas.style.touchAction = 'none'
canvas.width = document.documentElement.clientWidth
canvas.height = document.documentElement.clientHeight
window.addEventListener('resize', () => {
  canvas.width = document.documentElement.clientWidth
  canvas.height = document.documentElement.clientHeight
})

document.body.append(canvas)

const ctx = canvas.getContext('2d')!
export const engine = Matter.Engine.create()

const bubbles = new Map<Matter.Body, { color: number, size: number }>()
let rotateHue = 0

export function clearAll() {
  Matter.Composite.clear(engine.world, false)
  bubbles.clear()
}

ontick(update, 60)
ontick(draw, 30)

export const edge = 200

function update() {
  Matter.Engine.update(engine, 1000 / 60)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    if (pos.x < -edge ||
      pos.y < -edge ||
      pos.x > canvas.width + edge ||
      pos.y > canvas.height + edge) {
      Matter.Composite.remove(engine.world, b)
      bubbles.delete(b)
    }
  }
}

function draw() {
  rotateHue++
  if (rotateHue >= 360) rotateHue = 0

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const b of Matter.Composite.allBodies(engine.world)) {
    const pos = b.vertices[0]!

    const info = bubbles.get(b)!
    const size = info.size

    const hue = (info.color + rotateHue) % 360
    const lit = 53.33 + Math.max(0, 70 - Math.abs(244 - hue)) / 4 // magic!
    const col = (alpha: number) => `hsl(${hue}deg 100% ${lit}% / ${alpha})`

    const grad = ctx.createRadialGradient(pos.x, pos.y, size, pos.x + .01, pos.y + .01, 0)
    grad.addColorStop(0, col(1))
    grad.addColorStop(.01, col(1))
    grad.addColorStop(.07, col(.33))
    grad.addColorStop(.40, col(.13))
    grad.addColorStop(.80, col(0))
    grad.addColorStop(.90, '#0000')
    grad.addColorStop(1, '#0000')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
    ctx.fill()

    const grad2 = ctx.createRadialGradient(pos.x, pos.y, size, pos.x + .01, pos.y + .01 - 3, size / 2)
    grad2.addColorStop(0, col(.47))
    grad2.addColorStop(1, '#0000')
    ctx.fillStyle = grad2
    ctx.beginPath()
    ctx.ellipse(
      pos.x, pos.y - (size * 7 / 20),
      size * 16 / 20, size * 12 / 20,
      0,
      0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = `color-mix(in hsl, ${col(1)}, white 33%)`
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

export function addCircle(x: number, y: number, size: number) {
  const ox = Math.random() * 2 - 1
  const oy = Math.random() * 2 - 1

  const circle = Matter.Bodies.circle(x + ox, y + oy, size * (18 / 20))
  Matter.Composite.add(engine.world, circle)

  const color = Math.random() * 360
  bubbles.set(circle, { color, size })

  return { color, circle }
}

function ontick(fn: (d: number) => void, fps: number) {
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
