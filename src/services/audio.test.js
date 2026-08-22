import { describe, it, expect, beforeEach } from 'vitest'
import { playCard, playCapture, playWin, playLose } from './audio.js'

describe('audio', () => {
  beforeEach(() => localStorage.clear())

  it('no lanza errores sin AudioContext (jsdom/entornos sin audio)', () => {
    expect(() => {
      playCard()
      playCapture(2)
      playCapture(4)
      playWin()
      playLose()
    }).not.toThrow()
  })
})
