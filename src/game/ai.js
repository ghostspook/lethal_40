import { getLegalMoves } from './engine.js'
import { capturePoints } from './scoring.js'
import { cardValue, SCORE_TARGET } from './values.js'

const WIN_SCORE = 1_000_000
const POINT_WEIGHT = 1000

/**
 * Peligro de "botar" una carta sobre la mesa (cuánto le facilitamos
 * una captura al rival):
 * - Las cartas altas son más peligrosas (participan en más sumas).
 * - Las figuras (valor 0) son las más seguras.
 * - Botar una carta que coincide con otra de la mesa habilita el "igual".
 * - Botar una carta que completa una suma de dos cartas (2..7) también sube el riesgo.
 */
export function danger(card, table) {
  let d = cardValue(card.rank)

  if (table.some((t) => t.rank === card.rank)) d += 4

  const cv = cardValue(card.rank)
  if (cv > 0) {
    for (const t of table) {
      const tv = cardValue(t.rank)
      if (tv <= 0) continue
      const sum = cv + tv
      if (sum >= 2 && sum <= 7) d += 1
    }
  }

  return d
}

/**
 * Puntúa una jugada desde la perspectiva del jugador actual (a mayor, mejor):
 * 1. Ganar la partida es lo prioritario.
 * 2. Puntos inmediatos (4 > 2 > 0).
 * 3. Al capturar, se premia capturar más cartas y de mayor valor (niega al rival).
 * 4. Al botar, se penaliza el "peligro" de la carta.
 */
export function evaluateMove(state, move) {
  const player = state.currentPlayer
  const points =
    move.captured.length > 0
      ? capturePoints(move, state.table, state.lastThrownCard, state.score[player])
      : 0

  if (state.score[player] + points >= SCORE_TARGET) {
    return WIN_SCORE + points
  }

  let score = points * POINT_WEIGHT

  if (move.captured.length > 0) {
    const value = move.captured.reduce((sum, c) => sum + cardValue(c.rank), 0)
    score += move.captured.length * 3 + value
  } else {
    score -= danger(move.card, state.table)
  }

  return score
}

/**
 * Elige la mejor jugada legal para el jugador actual.
 * Entre jugadas de puntuación idéntica, elige al azar (evita ser predecible).
 * Devuelve `null` si no hay movimientos legales.
 */
export function chooseMove(state, rng = Math.random) {
  const moves = getLegalMoves(state)
  if (moves.length === 0) return null

  const scored = moves.map((move) => ({ move, score: evaluateMove(state, move) }))
  const best = Math.max(...scored.map((s) => s.score))
  const top = scored.filter((s) => s.score === best)

  return top[Math.floor(rng() * top.length)].move
}
