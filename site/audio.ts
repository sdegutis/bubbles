export const audio = new AudioContext()

function freqFromA4(n: number) {
  return 2 ** (n / 12) * 440
}

export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export function freqForNote(note: typeof notes[number], oct: number) {
  const index = notes.indexOf(note) + (12 * oct)
  return freqFromA4(-57 + index)
}
