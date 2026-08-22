import { describe, it, expect } from 'vitest'
import { createGame, getLegalMoves, applyMove } from './engine.js'
import { createDeck } from './deck.js'
import { capturePoints } from './scoring.js'
import { makeCard, otherPlayer } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

/** Estado manual para tests con control total de cartas. */
function state(over = {}) {
  return {
    phase: 'playing',
    deck: [],
    table: [],
    hands: { human: [], ai: [] },
    capturePiles: { human: [], ai: [] },
    score: { human: 0, ai: 0 },
    currentPlayer: 'human',
    dealer: 'ai',
    winner: null,
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

describe('createGame', () => {
  it('reparte 5 cartas a cada uno y juega primero el no-repartidor', () => {
    const g = createGame({ dealer: 'ai', rng: () => 0.5 })
    expect(g.hands.human).toHaveLength(5)
    expect(g.hands.ai).toHaveLength(5)
    expect(g.deck).toHaveLength(30)
    expect(g.dealer).toBe('ai')
    expect(g.currentPlayer).toBe('human') // no-repartidor
  })
})

describe('getLegalMoves', () => {
  it('incluye botar y capturas disponibles', () => {
    const st = state({
      hands: { human: [c('5'), c('7')], ai: [] },
      table: [c('5', 'diamonds'), c('3'), c('4')],
    })
    const moves = getLegalMoves(st)
    expect(moves.filter((m) => m.captured.length === 0)).toHaveLength(2) // 2 botar
    const caps = moves.filter((m) => m.captured.length > 0)
    expect(caps).toHaveLength(2) // 5→5 y 7→3+4
  })

  it('a 38 puntos no ofrece la jugada de 4', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4')],
    })
    const moves = getLegalMoves(st)
    expect(moves.find((m) => m.captured.length === 2)).toBeUndefined()
    expect(moves.some((m) => m.card.id === c('7').id && m.captured.length === 0)).toBe(true)
  })

  it('a 38 puntos sí ofrece caída simple (que no limpia la mesa)', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4'), c('K')],
    })
    const moves = getLegalMoves(st)
    expect(moves.some((m) => m.captured.length === 2)).toBe(true)
  })
})

describe('applyMove', () => {
  it('botar deja la carta en la mesa y cambia el turno', () => {
    const st = state({
      hands: { human: [c('5')], ai: [c('2')] },
      table: [c('K')],
    })
    const next = applyMove(st, { card: c('5'), captured: [] })
    expect(next.hands.human).toHaveLength(0)
    expect(next.table.map((x) => x.rank)).toEqual(['K', '5'])
    expect(next.currentPlayer).toBe('ai')
    expect(next.score.human).toBe(0)
  })

  it('capturar una carta sin limpiar la mesa no suma puntos', () => {
    const st = state({
      hands: { human: [c('5')], ai: [c('2')] },
      table: [c('5', 'diamonds'), c('K')],
    })
    const next = applyMove(st, { card: c('5'), captured: [c('5', 'diamonds')] })
    expect(next.score.human).toBe(0)
    expect(next.table.map((x) => x.rank)).toEqual(['K'])
    expect(next.capturePiles.human).toHaveLength(2)
    expect(next.currentPlayer).toBe('ai')
  })

  it('caída simple suma 2 puntos', () => {
    const st = state({
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4'), c('K')],
    })
    const next = applyMove(st, { card: c('7'), captured: [c('3'), c('4')] })
    expect(next.score.human).toBe(2)
    expect(next.capturePiles.human).toHaveLength(3)
    expect(next.currentPlayer).toBe('ai')
  })

  it('caída + ronda suma 4 puntos', () => {
    const st = state({
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4')],
    })
    const next = applyMove(st, { card: c('7'), captured: [c('3'), c('4')] })
    expect(next.score.human).toBe(4)
    expect(next.table).toHaveLength(0)
    expect(next.capturePiles.human).toHaveLength(3)
  })

  it('gana al llegar a 40', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4'), c('K')],
    })
    const next = applyMove(st, { card: c('7'), captured: [c('3'), c('4')] })
    expect(next.phase).toBe('gameOver')
    expect(next.winner).toBe('human')
    expect(next.score.human).toBe(40)
  })

  it('a 38 puntos la limpia gana', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('5')], ai: [] },
      table: [c('5', 'diamonds')],
    })
    const next = applyMove(st, { card: c('5'), captured: [c('5', 'diamonds')] })
    expect(next.score.human).toBe(40)
    expect(next.winner).toBe('human')
  })

  it('rechaza la jugada de 4 puntos a 38', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4')],
    })
    expect(() => applyMove(st, { card: c('7'), captured: [c('3'), c('4')] })).toThrow()
  })

  it('reparte la siguiente mano cuando ambos quedan sin cartas', () => {
    const st = state({
      deck: createDeck().slice(0, 10),
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
    })
    const next = applyMove(st, { card: c('K', 'spades'), captured: [] })
    expect(next.hands.human).toHaveLength(5)
    expect(next.hands.ai).toHaveLength(5)
    expect(next.deck).toHaveLength(0)
    expect(next.currentPlayer).toBe('human') // no-repartidor lidera
  })

  it('rebaraja las capturadas y alterna el repartidor al agotarse el mazo', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      capturePiles: {
        human: createDeck().slice(0, 6),
        ai: createDeck().slice(6, 12),
      },
      currentPlayer: 'human',
      dealer: 'ai',
    })
    const next = applyMove(st, { card: c('K', 'spades'), captured: [] })
    expect(next.dealer).toBe('human') // alterna
    expect(next.deck).toHaveLength(2) // 12 capturadas − 10 repartidas
    expect(next.hands.human).toHaveLength(5)
    expect(next.hands.ai).toHaveLength(5)
    expect(next.capturePiles.human).toHaveLength(0)
    expect(next.currentPlayer).toBe(otherPlayer('human')) // 'ai' lidera
  })
})

describe('integración', () => {
  it('una partida completa termina en gameOver sin errores', () => {
    let st = createGame({ rng: seededRng(12345) })
    let moves = 0
    while (st.phase === 'playing' && moves < 2000) {
      const legal = getLegalMoves(st)
      expect(legal.length).toBeGreaterThan(0)

      let best = legal[0]
      let bestPts = -1
      for (const m of legal) {
        const pts = m.captured.length === 0 ? 0 : capturePoints(m.captured, st.table)
        if (pts > bestPts) {
          bestPts = pts
          best = m
        }
      }
      st = applyMove(st, best)
      moves++
    }
    expect(st.phase).toBe('gameOver')
    expect(st.winner).toBeTruthy()
    expect(moves).toBeLessThan(2000)
  })
})
