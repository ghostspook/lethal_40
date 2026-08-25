import { createDeck, shuffle } from './deck.js'
import { SCORE_TARGET, otherPlayer } from './values.js'
import { getCaptureOptions, isValidCapture } from './captures.js'
import { capturePoints, cartonPoints } from './scoring.js'

export const HAND_SIZE = 5

/**
 * Crea una chica nueva (2 jugadores): mazo barajado, 5 cartas por jugador y
 * turno del jugador que NO reparte. Opciones para tests deterministas:
 * - `rng`: función aleatoria inyectable.
 * - `dealer`: 'human' | 'ai' (quién reparte la primera dada).
 */
export function createGame(options = {}) {
  const rng = options.rng ?? Math.random
  const dealer = options.dealer ?? (rng() < 0.5 ? 'human' : 'ai')

  const state = {
    phase: 'playing', // 'playing' | 'gameOver'
    deck: shuffle(createDeck(), rng),
    table: [],
    hands: { human: [], ai: [] },
    capturePiles: { human: [], ai: [] },
    score: { human: 0, ai: 0 },
    currentPlayer: null,
    dealer,
    winner: null,
    zapatero: null, // jugador perdedor si sufre zapatería (<10 pts)
    lastThrownCard: null, // { card, player } — última carta botada (para la caída)
    lastCapturer: null, // último jugador que capturó (para la mesa sobrante)
    rng,
  }

  return startDada(state)
}

/** Reparte 5 cartas continuas a cada jugador (primero el no-repartidor). */
function dealHand(state) {
  const hands = { human: [], ai: [] }
  const deck = state.deck.slice()
  const first = otherPlayer(state.dealer)

  for (let i = 0; i < HAND_SIZE; i++) {
    if (deck.length === 0) break
    hands[first].push(deck.shift())
  }
  for (let i = 0; i < HAND_SIZE; i++) {
    if (deck.length === 0) break
    hands[state.dealer].push(deck.shift())
  }

  return { ...state, hands, deck }
}

function countRanks(hand) {
  const counts = {}
  for (const c of hand) counts[c.rank] = (counts[c.rank] || 0) + 1
  return counts
}

function winnerAt(score) {
  if (score.human >= SCORE_TARGET) return 'human'
  if (score.ai >= SCORE_TARGET) return 'ai'
  return null
}

function endGame(state, winner) {
  const loser = otherPlayer(winner)
  const zapatero = state.score[loser] < 10 ? loser : null
  return { ...state, phase: 'gameOver', winner, zapatero, currentPlayer: winner }
}

/**
 * Inicia una dada: reparte y acredita Ronda / Doble Ronda al inicio del turno
 * del primer jugador (regla >30: sin anuncios por encima de 30 puntos).
 */
function startDada(state) {
  const dealt = dealHand(state)
  const score = { ...dealt.score }

  for (const p of ['human', 'ai']) {
    if (dealt.score[p] > 30) continue
    const counts = countRanks(dealt.hands[p])
    const values = Object.values(counts)
    if (values.some((n) => n >= 4)) score[p] += 4 // doble ronda
    else if (values.some((n) => n >= 3)) score[p] += 2 // ronda
  }

  const next = { ...dealt, score }
  const winner = winnerAt(score)
  if (winner) return endGame(next, winner)
  return { ...next, currentPlayer: otherPlayer(next.dealer) }
}

/** Reparte la siguiente dada, o resuelve el cartón al agotarse el mazo. */
function nextDada(state) {
  if (state.deck.length === 0) return resolveCarton(state)
  const dealer = otherPlayer(state.dealer)
  return startDada({ ...state, dealer })
}

/** Fin de ciclo (40 cartas agotadas): mesa sobrante, cartón y casos especiales. */
function resolveCarton(state) {
  const capturePiles = {
    human: [...state.capturePiles.human],
    ai: [...state.capturePiles.ai],
  }

  // La mesa sobrante va al pozo del último capturador (no activa caída ni limpia).
  // Fallback: si nadie capturó en el ciclo, va al último que botó una carta.
  const mesaOwner = state.lastCapturer ?? state.lastThrownCard?.player
  if (state.table.length > 0 && mesaOwner) {
    capturePiles[mesaOwner].push(...state.table)
  }

  const totals = { human: capturePiles.human.length, ai: capturePiles.ai.length }
  const nextDealer = otherPlayer(state.dealer)
  const score = { ...state.score }

  // Cartón (o "dos por dar" en empate / si nadie llega a 19).
  const nobodyReaches = totals.human < 19 && totals.ai < 19
  if (nobodyReaches || totals.human === totals.ai) {
    if (score[nextDealer] < 38) score[nextDealer] += 2 // dos por dar
  } else {
    for (const p of ['human', 'ai']) {
      if (score[p] >= 38) continue // 38 no juega cartón
      score[p] += cartonPoints(totals[p])
    }
  }

  // Dos por falla: un equipo sin capturas regala +2 al rival.
  for (const p of ['human', 'ai']) {
    if (totals[p] === 0) {
      const rival = otherPlayer(p)
      if (score[rival] < 38) score[rival] += 2
    }
  }

  const next = { ...state, capturePiles, table: [], score }
  const winner = winnerAt(score)
  if (winner) return endGame(next, winner)

  // Rebarajar todo y continuar la chica.
  const deck = shuffle([...capturePiles.human, ...capturePiles.ai], state.rng)
  return startDada({
    ...next,
    deck,
    capturePiles: { human: [], ai: [] },
    dealer: nextDealer,
    lastThrownCard: null,
    lastCapturer: null,
  })
}

/**
 * Movimientos legales del jugador actual. Un movimiento es:
 * `{ card, captured, initialCaptured }`; `captured` vacío = "botar".
 */
export function getLegalMoves(state) {
  if (state.phase !== 'playing') return []

  const player = state.currentPlayer
  const moves = []

  for (const card of state.hands[player]) {
    moves.push({ card, captured: [], initialCaptured: [] })
    for (const opt of getCaptureOptions(card, state.table)) {
      moves.push({ card, captured: opt.captured, initialCaptured: opt.initialCaptured })
    }
  }

  return moves
}

/**
 * Aplica un movimiento y devuelve un NUEVO estado (no muta `state`).
 * Resuelve capturas, escalera, puntos, victoria, cambio de turno y reparto.
 */
export function applyMove(state, move) {
  if (state.phase !== 'playing') throw new Error('La partida ya terminó')

  const player = state.currentPlayer
  const hands = { human: [...state.hands.human], ai: [...state.hands.ai] }

  const idx = hands[player].findIndex((c) => c.id === move.card.id)
  if (idx === -1) throw new Error('La carta no está en la mano del jugador')
  const [card] = hands[player].splice(idx, 1)

  if (!isValidCapture(card, move, state.table)) {
    throw new Error('Captura inválida')
  }

  const capturePiles = {
    human: [...state.capturePiles.human],
    ai: [...state.capturePiles.ai],
  }

  let table = state.table
  let lastThrownCard = state.lastThrownCard
  let lastCapturer = state.lastCapturer

  let points = 0
  if (move.captured.length > 0) {
    const capturedIds = new Set(move.captured.map((c) => c.id))
    table = state.table.filter((c) => !capturedIds.has(c.id))
    capturePiles[player].push(card, ...move.captured)
    points = capturePoints(move, state.table, state.lastThrownCard, state.score[player])
    lastThrownCard = null
    lastCapturer = player
  } else {
    table = [...state.table, card]
    lastThrownCard = { card, player }
  }

  const score = { ...state.score, [player]: state.score[player] + points }
  const next = { ...state, hands, table, capturePiles, score, lastThrownCard, lastCapturer }

  const winner = winnerAt(score)
  if (winner) return endGame(next, winner)

  if (hands.human.length === 0 && hands.ai.length === 0) {
    return nextDada(next)
  }
  return { ...next, currentPlayer: otherPlayer(player) }
}
