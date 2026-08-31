let ctx = null
let muted = false

function ac() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(v) {
  muted = v
}

function tone({ freq = 440, dur = 0.15, type = 'sine', gain = 0.08, delay = 0, slideTo = null }) {
  const c = ac()
  if (!c || muted) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export const sfx = {
  unlock: () => tone({ freq: 1, dur: 0.01, gain: 0.0001 }),
  click: () => tone({ freq: 620, dur: 0.08, type: 'triangle', gain: 0.05 }),
  place: () => tone({ freq: 880, dur: 0.12, type: 'triangle', gain: 0.06, slideTo: 1320 }),
  tick: () => tone({ freq: 1200, dur: 0.04, type: 'square', gain: 0.035 }),
  success: (tier) => {
    const scales = {
      perfect: [523, 659, 784, 1047, 1319],
      great: [523, 659, 784, 1047],
      good: [523, 659, 784],
      ok: [523, 659],
      meh: [440],
      bad: [330],
    }
    const notes = scales[tier] || [440]
    notes.forEach((f, i) =>
      tone({ freq: f, dur: 0.22, type: 'triangle', gain: 0.07, delay: i * 0.08 })
    )
  },
  fail: () => tone({ freq: 300, dur: 0.35, type: 'sawtooth', gain: 0.05, slideTo: 110 }),
  finish: () =>
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
      tone({ freq: f, dur: 0.28, type: 'triangle', gain: 0.07, delay: i * 0.11 })
    ),
}
