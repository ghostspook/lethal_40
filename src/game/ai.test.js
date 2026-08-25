import { describe, it, expect } from 'vitest'
import { chooseMove, evaluateMove, danger } from './ai.js'
import { createGame, applyMove } from './engine.js'
import { makeCard } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

function state(over = {}) {
  return {
    phase: 'playing',
    deck: [],
    table: [],
    hands: { human: [], ai: [] },
    capturePiles: { human: [], ai: [] },
    score: { human: 0, ai: 0 },
    currentPlayer: 'ai',
    dealer: 'human',
    winner: null,
    zapatero: null,
    lastThrownCard: null,
    lastCapturer: null,
    rng: Math.random,
    ...over,
  }
}

function seededRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

describe('danger', () => {
  it('las figuras son más seguras que las cartas altas', () => {
    expect(danger(c('K'), [c('2')])).toBeLessThan(danger(c('7'), [c('2')]))
  })

  it('botar una carta que coincide con otra de la mesa es más peligroso', () => {
    expect(danger(c('7'), [c('7', 'diamonds')])).toBeGreaterThan(danger(c('7'), [c('2')]))
  })
})

describe('evaluateMove', () => {
  it('una caída ganadora recibe un valor enorme', () => {
    const st = state({
      score: { ai: 38, human: 0 },
      hands: { ai: [c('7')], human: [] },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'human' },
    })
    const move = { card: c('7'), captured: [c('3'), c('4')], initialCaptured: [c('3'), c('4')] }
    expect(evaluateMove(st, move)).toBeGreaterThan(1_000_000)
  })

  it('valora más la caída + limpia (4) que la caída simple (2)', () => {
    const cleared = state({
      hands: { ai: [c('7')], human: [] },
      table: [c('3'), c('4')],
      lastThrownCard: { card: c('3'), player: 'human' },
    })
    const notCleared = state({
      hands: { ai: [c('7')], human: [] },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'human' },
    })
    const move = { card: c('7'), captured: [c('3'), c('4')], initialCaptured: [c('3'), c('4')] }
    expect(evaluateMove(cleared, move)).toBeGreaterThan(evaluateMove(notCleared, move))
  })

  it('a 38 una limpia sola no cuenta como victoria', () => {
    const st = state({
      score: { ai: 38, human: 0 },
      hands: { ai: [c('7')], human: [] },
      table: [c('3'), c('4')],
    })
    const move = { card: c('7'), captured: [c('3'), c('4')], initialCaptured: [c('3'), c('4')] }
    expect(evaluateMove(st, move)).toBeLessThan(1_000_000)
  })
})

describe('chooseMove', () => {
  it('elige la caída ganadora', () => {
    const st = state({
      hands: { ai: [c('7')], human: [c('2')] },
      score: { ai: 38, human: 0 },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'human' },
    })
    const move = chooseMove(st, () => 0)
    expect(move.captured.map((x) => x.rank).sort()).toEqual(['3', '4'])
    expect(applyMove(st, move).winner).toBe('ai')
  })

  it('prefiere capturar (puntos) antes que botar', () => {
    const st = state({
      hands: { ai: [c('7'), c('K')], human: [c('2')] },
      table: [c('3'), c('4')],
    })
    const move = chooseMove(st, () => 0)
    expect(move.card.id).toBe(c('7').id)
    expect(move.captured).toHaveLength(2)
  })

  it('sin capturas, bota la carta más segura (la figura)', () => {
    const st = state({
      hands: { ai: [c('K'), c('7')], human: [c('2')] },
      table: [c('2')],
    })
    const move = chooseMove(st, () => 0)
    expect(move.card.id).toBe(c('K').id)
    expect(move.captured).toHaveLength(0)
  })

  it('a 38 una limpia sola no termina la partida', () => {
    const st = state({
      hands: { ai: [c('7')], human: [c('2')] },
      score: { ai: 38, human: 0 },
      table: [c('3'), c('4')],
    })
    const move = chooseMove(st, () => 0)
    const next = applyMove(st, move)
    expect(next.score.ai).toBe(38)
    expect(next.phase).toBe('playing')
  })

  it('elige determinísticamente entre jugadas equivalentes según el rng', () => {
    const st = state({
      hands: { ai: [c('K'), c('Q')], human: [c('2')] },
      table: [c('2')],
    })
    expect(chooseMove(st, () => 0).card.id).toBe(c('K').id)
    expect(chooseMove(st, () => 0.99).card.id).toBe(c('Q').id)
  })

  it('devuelve null si no hay movimientos legales', () => {
    const st = state({ hands: { ai: [], human: [] }, currentPlayer: 'ai' })
    expect(chooseMove(st)).toBeNull()
  })
})

describe('integración IA', () => {
  it('una chica IA contra IA termina sin errores', () => {
    const rng = seededRng(42)
    let st = createGame({ rng })
    let moves = 0

    while (st.phase === 'playing' && moves < 4000) {
      const move = chooseMove(st, rng)
      expect(move).not.toBeNull()
      st = applyMove(st, move)
      moves++
    }

    expect(st.phase).toBe('gameOver')
    expect(st.winner).toBeTruthy()
    expect(moves).toBeLessThan(4000)
  })
})
