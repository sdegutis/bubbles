import { audio, freqForNote, notes } from "./audio.js"
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
  const count = e.pressure ** e.pressure
  for (let i = 0; i < count; i++) {
    const rand = Math.random()

    const size = rand * (sizes.max - sizes.min) + sizes.min
    const { circle, color } = addCircle(e.clientX, e.clientY, size)
    Matter.Body.setVelocity(circle, { x: e.movementX / 5, y: e.movementY / 5 })

    const i = Math.floor(color / 360 * notes.length)
    const note = notes[i]!
    const octave = Math.floor((1 - rand) * 3 + 4)

    const end = audio.currentTime + .1

    const gain = new GainNode(audio, { gain: .025 })
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    gain.connect(audio.destination)

    const osc = new OscillatorNode(audio, { type: 'sine', frequency: freqForNote(note, octave) })
    osc.connect(gain)
    osc.start(0)
    osc.stop(end)
    osc.onended = () => {
      osc.disconnect()
      gain.disconnect()
    }
  }
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
