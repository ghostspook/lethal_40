import { RANKS, SUITS, makeCard } from './values.js'

/** Crea el mazo de 40 cartas (10 rangos × 4 palos, sin 8/9/10). */
export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(makeCard(rank, suit))
    }
  }
  return deck
}

/**
 * Baraja una copia del arreglo (Fisher–Yates). No muta el original.
 * Acepta un RNG inyectable para tests deterministas.
 */
export function shuffle(cards, rng = Math.random) {
  const arr = cards.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
