import { describe, it, expect } from 'vitest'
import { createGame, getLegalMoves, applyMove, HAND_SIZE } from './engine.js'
import { createDeck } from './deck.js'
import { chooseMove } from './ai.js'
import { makeCard } from './values.js'

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

const botar = (card) => ({ card, captured: [], initialCaptured: [] })
const capturar = (card, captured, initial = captured) => ({ card, captured, initialCaptured: initial })

describe('createGame', () => {
  it('reparte 5 cartas a cada uno y juega primero el no-repartidor', () => {
    const g = createGame({ dealer: 'ai', rng: () => 0.5 })
    expect(g.hands.human).toHaveLength(5)
    expect(g.hands.ai).toHaveLength(5)
    expect(g.deck).toHaveLength(30)
    expect(g.dealer).toBe('ai')
    expect(g.currentPlayer).toBe('human')
  })
})

describe('getLegalMoves', () => {
  it('incluye botar y capturas disponibles', () => {
    const st = state({
      hands: { human: [c('5'), c('7')], ai: [] },
      table: [c('5', 'diamonds'), c('3'), c('4')],
    })
    const moves = getLegalMoves(st)
    expect(moves.filter((m) => m.captured.length === 0)).toHaveLength(2)
    const caps = moves.filter((m) => m.captured.length > 0)
    expect(caps.length).toBeGreaterThanOrEqual(2) // 5→5 y 7→3+4
  })
})

describe('applyMove — puntos de captura', () => {
  it('botar deja la carta en la mesa y cambia el turno', () => {
    const st = state({ hands: { human: [c('5')], ai: [c('2')] }, table: [c('K')] })
    const next = applyMove(st, botar(c('5')))
    expect(next.hands.human).toHaveLength(0)
    expect(next.table.map((x) => x.rank)).toEqual(['K', '5'])
    expect(next.currentPlayer).toBe('ai')
    expect(next.score.human).toBe(0)
  })

  it('captura sin caída y sin limpia = 0 puntos', () => {
    const st = state({
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4'), c('K')],
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(0)
    expect(next.table.map((x) => x.rank)).toEqual(['K'])
    expect(next.capturePiles.human).toHaveLength(3)
  })

  it('limpia (mesa vacía) suma 2', () => {
    const st = state({ hands: { human: [c('7')], ai: [c('2')] }, table: [c('3'), c('4')] })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(2)
    expect(next.table).toHaveLength(0)
  })

  it('caída (captura la carta del rival anterior) suma 2', () => {
    const st = state({
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'ai' },
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(2)
  })

  it('caída + limpia suma 4', () => {
    const st = state({
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4')],
      lastThrownCard: { card: c('3'), player: 'ai' },
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(4)
  })

  it('rechaza una captura inválida', () => {
    const st = state({ hands: { human: [c('7')], ai: [c('2')] }, table: [c('3'), c('3')] })
    expect(() => applyMove(st, capturar(c('7'), [c('3'), c('3')]))).toThrow()
  })
})

describe('applyMove — regla del 38', () => {
  it('a 38 la limpia sola no gana (congelada)', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4')],
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(38)
    expect(next.phase).toBe('playing')
  })

  it('a 38 la caída gana', () => {
    const st = state({
      score: { human: 38, ai: 0 },
      hands: { human: [c('7')], ai: [] },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'ai' },
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.score.human).toBe(40)
    expect(next.phase).toBe('gameOver')
    expect(next.winner).toBe('human')
  })
})

describe('fin de ciclo — cartón y casos especiales', () => {
  it('cartón por equipo (21 vs 19) y re-reparte', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      table: [],
      capturePiles: { human: createDeck().slice(0, 20), ai: createDeck().slice(20, 39) },
      lastCapturer: 'human',
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    // 20 + mesa(1) = 21 → 8 pts; 19 → 6 pts
    expect(next.score.human).toBe(8)
    expect(next.score.ai).toBe(6)
    expect(next.hands.human).toHaveLength(5)
    expect(next.hands.ai).toHaveLength(5)
    expect(next.deck).toHaveLength(30)
    expect(next.dealer).toBe('human') // siguiente repartidor
    expect(next.currentPlayer).toBe('ai')
  })

  it('empate de cartones (20-20) → dos por dar al siguiente repartidor', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      table: [],
      capturePiles: { human: createDeck().slice(0, 19), ai: createDeck().slice(19, 39) },
      lastCapturer: 'human',
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    // 19 + mesa(1) = 20 vs 20 → empate → +2 al siguiente repartidor (human)
    expect(next.score.human).toBe(2)
    expect(next.score.ai).toBe(0)
  })

  it('a 38 no se acredita el cartón (congelado)', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      table: [],
      capturePiles: { human: createDeck().slice(0, 20), ai: createDeck().slice(20, 39) },
      lastCapturer: 'human',
      score: { human: 38, ai: 0 },
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    expect(next.score.human).toBe(38) // 21 cartas pero congelado
    expect(next.score.ai).toBe(6) // 19 cartas
  })

  it('asigna la mesa al último botador si nadie capturó en el ciclo', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      table: [],
      capturePiles: { human: createDeck().slice(0, 19), ai: createDeck().slice(19, 39) },
      lastCapturer: null,
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    // Nadie capturó: la mesa (K) va al último botador (human) → 20 vs 20 → dos por dar.
    expect(next.score.human).toBe(2)
    expect(next.score.ai).toBe(0)
  })

  it('dos por falla: equipo sin capturas regala +2 al rival', () => {
    const st = state({
      deck: [],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      table: [],
      capturePiles: { human: createDeck().slice(0, 39), ai: [] },
      lastCapturer: 'human',
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    // 40 cartas → cartón 26 + dos por falla 2 = 28
    expect(next.score.human).toBe(28)
    expect(next.score.ai).toBe(0)
  })
})

describe('ronda y doble ronda', () => {
  it('acredita ronda (+2) al inicio de la dada si hay 3 del mismo rango', () => {
    const st = state({
      deck: [
        c('A'), c('4'), c('6'), c('7'), c('K'),
        c('5'), c('5', 'diamonds'), c('5', 'clubs'), c('2'), c('3'),
      ],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      score: { human: 0, ai: 0 },
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    // nuevo repartidor = human; la mano del no-repartidor (ai) no tiene ronda,
    // la del repartidor (human) sí (tres 5).
    expect(next.score.human).toBe(2)
  })

  it('no acredita ronda por encima de 30 puntos', () => {
    const st = state({
      deck: [
        c('A'), c('4'), c('6'), c('7'), c('K'),
        c('5'), c('5', 'diamonds'), c('5', 'clubs'), c('2'), c('3'),
      ],
      hands: { human: [c('K', 'spades')], ai: [] },
      currentPlayer: 'human',
      dealer: 'ai',
      score: { human: 32, ai: 0 },
    })
    const next = applyMove(st, botar(c('K', 'spades')))
    expect(next.score.human).toBe(32) // >30 → sin ronda
  })
})

describe('zapatería', () => {
  it('gana con rival por debajo de 10 puntos', () => {
    const st = state({
      score: { human: 38, ai: 8 },
      hands: { human: [c('7')], ai: [c('2')] },
      table: [c('3'), c('4'), c('K')],
      lastThrownCard: { card: c('3'), player: 'ai' },
    })
    const next = applyMove(st, capturar(c('7'), [c('3'), c('4')]))
    expect(next.phase).toBe('gameOver')
    expect(next.winner).toBe('human')
    expect(next.zapatero).toBe('ai')
  })
})

describe('integración', () => {
  it('una chica completa termina en gameOver sin errores', () => {
    const rng = seededRng(12345)
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

  it('las manos nunca exceden 5 cartas durante la partida', () => {
    const rng = seededRng(42)
    let st = createGame({ rng })
    let moves = 0
    while (st.phase === 'playing' && moves < 4000) {
      const move = chooseMove(st, rng)
      st = applyMove(st, move)
      moves++
      expect(st.hands.human.length).toBeLessThanOrEqual(HAND_SIZE)
      expect(st.hands.ai.length).toBeLessThanOrEqual(HAND_SIZE)
    }
    expect(st.phase).toBe('gameOver')
  })
})
