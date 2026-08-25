import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './game.js'
import { useStatsStore } from './stats.js'
import { hasSavedGame } from '../services/storage.js'
import { makeCard } from '../game/values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

describe('game store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('inicia una partida válida con 5 cartas por jugador', () => {
    const store = useGameStore()
    store.startGame()
    expect(store.game).not.toBeNull()
    expect(store.game.phase).toBe('playing')
    expect(store.humanHand).toHaveLength(5)
    expect(store.aiHand).toHaveLength(5)
    expect(hasSavedGame()).toBe(true)
  })

  it('la IA juega automáticamente cuando es su turno', () => {
    const store = useGameStore()
    store.startGame()

    store.game = { ...store.game, currentPlayer: 'ai' }
    store._maybeScheduleAi()
    vi.advanceTimersByTime(1000)

    expect(store.currentPlayer).toBe('human')
    expect(store.log).toHaveLength(1)
  })

  it('reanuda una partida guardada', () => {
    const store = useGameStore()
    store.startGame()
    expect(store.humanHand).toHaveLength(5)

    store.game = null // simula cerrar la app
    expect(store.resumeGame()).toBe(true)
    expect(store.humanHand).toHaveLength(5)
  })

  it('al ganar registra estadísticas y limpia la partida guardada', () => {
    const store = useGameStore()
    const stats = useStatsStore()

    store.game = {
      phase: 'playing',
      deck: [],
      table: [c('3'), c('4'), c('K')],
      hands: { human: [c('7')], ai: [c('2')] },
      capturePiles: { human: [], ai: [] },
      score: { human: 38, ai: 0 },
      currentPlayer: 'human',
      dealer: 'ai',
      winner: null,
      zapatero: null,
      lastThrownCard: { card: c('3'), player: 'ai' },
      lastCapturer: null,
      rng: Math.random,
    }

    store.playMove({ card: c('7'), captured: [c('3'), c('4')], initialCaptured: [c('3'), c('4')] })

    expect(store.isGameOver).toBe(true)
    expect(store.winner).toBe('human')
    expect(store.game.zapatero).toBe('ai')
    expect(stats.stats.wins).toBe(1)
    expect(hasSavedGame()).toBe(false)
  })
})
