// Sonidos sintetizados con Web Audio API (sin archivos de audio).
// Cada función respeta el ajuste de sonido guardado en localStorage.

import { loadSettings } from './storage.js'

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

function enabled() {
  try {
    return loadSettings().sound
  } catch {
    return true
  }
}

function tone(freq, duration, { type = 'sine', gain = 0.12, when = 0, sweepTo = null } = {}) {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})

  const t0 = c.currentTime + when
  const osc = c.createOscillator()
  const amp = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration)

  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(amp)
  amp.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.03)
}

/** Golpe suave al jugar una carta (o botar). */
export function playCard() {
  if (!enabled()) return
  tone(340, 0.09, { type: 'triangle', gain: 0.16, sweepTo: 200 })
}

/** Campanilla al capturar; más aguda si la captura vale 4. */
export function playCapture(points = 2) {
  if (!enabled()) return
  const base = points >= 4 ? 880 : 660
  tone(base, 0.12, { type: 'sine', gain: 0.15 })
  tone(base * 1.26, 0.16, { type: 'sine', gain: 0.12, when: 0.07 })
}

/** Fanfarria de victoria. */
export function playWin() {
  if (!enabled()) return
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => tone(f, 0.18, { type: 'triangle', gain: 0.14, when: i * 0.12 }))
}

/** Tonos descendentes de derrota. */
export function playLose() {
  if (!enabled()) return
  const notes = [392, 311.13, 261.63]
  notes.forEach((f, i) => tone(f, 0.24, { type: 'sine', gain: 0.14, when: i * 0.16 }))
}
