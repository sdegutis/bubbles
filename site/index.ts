import { notes, playNote } from "./audio.js"
import { addCircle, canvas, engine, Matter } from "./lib.js"

engine.gravity.y = 0.15
window.addEventListener('deviceorientation', e => {
  engine.gravity.y = (e.beta ?? 0.15 * 140) / 140
  engine.gravity.x = (e.gamma ?? 0) / 140
}, true)

const aborts = new Map<number, AbortController>()

let sizes = getSizeBounds()
window.addEventListener('resize', () => sizes = getSizeBounds())

function getSizeBounds() {
  const p = 15
  const max = Math.min(
    document.documentElement.clientWidth * p / 100,
    document.documentElement.clientHeight * p / 100,
  )
  const min = max / 7
  return { min, max }
}


function addCircles(e: PointerEvent) {
  for (let i = 0; i < 1 * e.pressure ** e.pressure; i++) {
    const rand = Math.random()

    const size = rand * (sizes.max - sizes.min) + sizes.min
    const circle = addCircle(e.clientX, e.clientY, size)
    Matter.Body.setVelocity(circle, { x: e.movementX / 10, y: e.movementY / 10 })

    const note = randomElement(notes)
    const octave = Math.floor((1 - rand) * 3 + 4)
    playNote(note, octave, .3, { type: 'sine' })
  }

  // navigator.vibrate(1)
}

function randomElement<A extends ArrayLike<any>, K extends Exclude<keyof A, keyof any[]>>(array: A): A[K] {
  const i = Math.floor(Math.random() * array.length)
  return array[i]!
}

canvas.onpointerdown = e => {
  canvas.setPointerCapture(e.pointerId)

  const abort = new AbortController()
  aborts.set(e.pointerId, abort)

  addCircles(e)
  canvas.addEventListener('pointermove', addCircles, { signal: abort.signal })

  canvas.addEventListener('pointerup', (e) => {
    aborts.get(e.pointerId)!.abort()
  }, { once: true, })
}
