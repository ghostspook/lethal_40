import { createDeck, shuffle } from './deck.js'
import { SCORE_TARGET, otherPlayer } from './values.js'
import { getCaptureOptions, isValidCapture } from './captures.js'
import { capturePoints, isAllowedBy38 } from './scoring.js'

export const HAND_SIZE = 5

/**
 * Crea una partida nueva: mazo barajado, 5 cartas por jugador y turno
 * del jugador que NO reparte.
 *
 * Opciones (para tests deterministas):
 * - `rng`: función aleatoria inyectable.
 * - `dealer`: 'human' | 'ai' (quién reparte la primera ronda).
 */
export function createGame(options = {}) {
  const rng = options.rng ?? Math.random
  const dealer = options.dealer ?? (rng() < 0.5 ? 'human' : 'ai')

  let state = {
    phase: 'playing', // 'playing' | 'gameOver'
    deck: shuffle(createDeck(), rng),
    table: [],
    hands: { human: [], ai: [] },
    capturePiles: { human: [], ai: [] },
    score: { human: 0, ai: 0 },
    currentPlayer: null,
    dealer,
    winner: null,
    rng,
  }

  state = dealHand(state)
  return { ...state, currentPlayer: otherPlayer(state.dealer) }
}

/** Reparte 5 cartas a cada jugador, alternando, empezando por el no-repartidor. */
function dealHand(state) {
  const hands = { human: [...state.hands.human], ai: [...state.hands.ai] }
  const deck = state.deck.slice()
  const first = otherPlayer(state.dealer)

  for (let i = 0; i < HAND_SIZE * 2; i++) {
    if (deck.length === 0) break
    const player = i % 2 === 0 ? first : state.dealer
    hands[player].push(deck.shift())
  }

  return { ...state, hands, deck }
}

/**
 * Reparte la siguiente mano. Si el mazo está agotado, rebaraja las cartas
 * capturadas para formar un nuevo mazo y alterna el repartidor. La mesa persiste.
 */
function nextHand(state) {
  if (state.deck.length === 0) {
    const captured = [...state.capturePiles.human, ...state.capturePiles.ai]
    return dealHand({
      ...state,
      deck: shuffle(captured, state.rng),
      capturePiles: { human: [], ai: [] },
      dealer: otherPlayer(state.dealer),
    })
  }
  return dealHand(state)
}

/**
 * Movimientos legales del jugador actual. Un movimiento es:
 * `{ card, captured }` donde `captured` vacío = "botar".
 */
export function getLegalMoves(state) {
  if (state.phase !== 'playing') return []

  const player = state.currentPlayer
  const moves = []

  for (const card of state.hands[player]) {
    moves.push({ card, captured: [] })
    for (const captured of getCaptureOptions(card, state.table)) {
      if (isAllowedBy38(captured, state.table, state.score[player])) {
        moves.push({ card, captured })
      }
    }
  }

  return moves
}

/**
 * Aplica un movimiento y devuelve un NUEVO estado (no muta `state`).
 * Resuelve capturas, puntos, victoria, cambio de turno y reparto de manos.
 */
export function applyMove(state, move) {
  if (state.phase !== 'playing') throw new Error('La partida ya terminó')

  const player = state.currentPlayer
  const hands = { human: [...state.hands.human], ai: [...state.hands.ai] }

  const idx = hands[player].findIndex((c) => c.id === move.card.id)
  if (idx === -1) throw new Error('La carta no está en la mano del jugador')
  const [card] = hands[player].splice(idx, 1)

  if (!isValidCapture(card, move.captured, state.table)) {
    throw new Error('Captura inválida')
  }

  const capturePiles = {
    human: [...state.capturePiles.human],
    ai: [...state.capturePiles.ai],
  }

  let table = state.table
  let points = 0

  if (move.captured.length > 0) {
    if (!isAllowedBy38(move.captured, state.table, state.score[player])) {
      throw new Error('Jugada de 4 puntos prohibida en 38')
    }
    const capturedIds = new Set(move.captured.map((c) => c.id))
    table = state.table.filter((c) => !capturedIds.has(c.id))
    capturePiles[player].push(card, ...move.captured)
    points = capturePoints(move.captured, state.table)
  } else {
    table = [...state.table, card]
  }

  const score = { ...state.score, [player]: state.score[player] + points }

  if (score[player] >= SCORE_TARGET) {
    return {
      ...state,
      hands,
      table,
      capturePiles,
      score,
      phase: 'gameOver',
      winner: player,
      currentPlayer: player,
    }
  }

  let next = { ...state, hands, table, capturePiles, score }

  if (hands.human.length === 0 && hands.ai.length === 0) {
    next = nextHand(next)
    next = { ...next, currentPlayer: otherPlayer(next.dealer) }
  } else {
    next = { ...next, currentPlayer: otherPlayer(player) }
  }

  return next
}
