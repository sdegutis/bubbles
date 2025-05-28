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
    playNote(note, octave, .1, { type: 'sine', volume: .25 })
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













const audio = new AudioContext()

function freqFromA4(n: number) {
  return 2 ** (n / 12) * 440
}

export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

function freqForNote(note: typeof notes[number], oct: number) {
  const index = notes.indexOf(note) + (12 * oct)
  return freqFromA4(-57 + index)
}

export function playNote(note: typeof notes[number], octave: number, duration: number, options?: {
  type?: OscillatorType,
  volume?: number,
  delay?: number,
}) {
  const g = audio.createGain()
  if (options?.volume !== undefined) g.gain.value = options.volume
  g.connect(audio.destination)

  g.gain.exponentialRampToValueAtTime(0.00001, audio.currentTime + duration)

  let node: GainNode | DelayNode = g

  if (options?.delay) {
    node = new DelayNode(audio, {
      delayTime: options.delay,
      maxDelayTime: options.delay,
    })
  }

  const o = audio.createOscillator()
  o.connect(node)

  if (options?.type !== undefined) o.type = options?.type
  o.frequency.value = freqForNote(note, octave)
  o.start(0)
  o.stop(audio.currentTime + duration)
  o.onended = () => {
    o.disconnect()
    g.disconnect()
  }
}
