import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  loadHistory,
  appendHistory,
  saveGame,
  loadGame,
  hasSavedGame,
  clearGame,
} from './storage.js'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('devuelve valores por defecto cuando no hay datos', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(loadStats()).toEqual({ wins: 0, losses: 0, streak: 0 })
    expect(loadHistory()).toEqual([])
    expect(hasSavedGame()).toBe(false)
  })

  it('guarda y recupera ajustes y estadísticas', () => {
    saveSettings({ sound: false, aiDelay: 500 })
    expect(loadSettings().sound).toBe(false)
    expect(loadSettings().aiDelay).toBe(500)

    saveStats({ wins: 3, losses: 1, streak: 2 })
    expect(loadStats().wins).toBe(3)
  })

  it('guarda y reanuda una partida (regenerando la función rng)', () => {
    const state = {
      phase: 'playing',
      deck: [],
      table: [],
      hands: { human: [], ai: [] },
      capturePiles: { human: [], ai: [] },
      score: { human: 10, ai: 8 },
      currentPlayer: 'human',
      dealer: 'ai',
      winner: null,
      rng: Math.random,
    }
    saveGame(state)
    expect(hasSavedGame()).toBe(true)

    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded.score.human).toBe(10)
    expect(typeof loaded.rng).toBe('function')
  })

  it('no reanuda una partida terminada', () => {
    saveGame({ phase: 'gameOver', winner: 'human', score: { human: 40, ai: 0 } })
    expect(loadGame()).toBeNull()
    expect(hasSavedGame()).toBe(false)
  })

  it('clearGame elimina la partida guardada', () => {
    saveGame({ phase: 'playing', score: { human: 0, ai: 0 } })
    clearGame()
    expect(hasSavedGame()).toBe(false)
  })

  it('appendHistory antepone y limita a 50 entradas', () => {
    for (let i = 0; i < 60; i++) {
      appendHistory({ result: 'win', date: `d${i}` })
    }
    const history = loadHistory()
    expect(history).toHaveLength(50)
    expect(history[0].date).toBe('d59')
  })
})
