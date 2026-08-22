import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStatsStore } from './stats.js'

describe('stats store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('empieza en cero', () => {
    const stats = useStatsStore()
    expect(stats.stats).toEqual({ wins: 0, losses: 0, streak: 0 })
    expect(stats.history).toEqual([])
  })

  it('registra victorias/derrotas y la racha', () => {
    const stats = useStatsStore()

    stats.recordGame({ result: 'win', humanScore: 40, aiScore: 20 })
    stats.recordGame({ result: 'win', humanScore: 40, aiScore: 10 })
    expect(stats.stats.wins).toBe(2)
    expect(stats.stats.losses).toBe(0)
    expect(stats.stats.streak).toBe(2)

    stats.recordGame({ result: 'loss', humanScore: 0, aiScore: 40 })
    expect(stats.stats.streak).toBe(-1)
    expect(stats.stats.losses).toBe(1)
  })

  it('guarda el historial con la partida más reciente primero', () => {
    const stats = useStatsStore()
    stats.recordGame({ result: 'win', humanScore: 40, aiScore: 20 })
    stats.recordGame({ result: 'loss', humanScore: 10, aiScore: 40 })

    expect(stats.history).toHaveLength(2)
    expect(stats.history[0].result).toBe('loss')
    expect(stats.history[1].result).toBe('win')
  })
})
