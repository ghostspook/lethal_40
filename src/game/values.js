// Valores y representación de las cartas de Cuarenta.

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K']
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']

export const SCORE_TARGET = 40
export const PLAYERS = ['human', 'ai']

/**
 * Valor numérico de una carta para las capturas "por suma".
 * A = 1, 2..7 = su valor, J/Q/K = 0.
 */
export function cardValue(rank) {
  if (rank === 'A') return 1
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 0
  return Number(rank)
}

/** Crea una carta inmutable con un id único. */
export function makeCard(rank, suit) {
  return { id: `${rank}-${suit}`, rank, suit }
}

/** Devuelve el otro jugador. */
export function otherPlayer(player) {
  return player === 'human' ? 'ai' : 'human'
}
