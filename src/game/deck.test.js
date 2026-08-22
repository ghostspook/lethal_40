import { describe, it, expect } from 'vitest'
import { createDeck, shuffle } from './deck.js'
import { RANKS } from './values.js'

describe('createDeck', () => {
  it('tiene 40 cartas (10 rangos × 4 palos)', () => {
    expect(createDeck()).toHaveLength(40)
  })

  it('no incluye 8, 9 ni 10', () => {
    const ranks = new Set(createDeck().map((c) => c.rank))
    expect(ranks.has('8')).toBe(false)
    expect(ranks.has('9')).toBe(false)
    expect(ranks.has('10')).toBe(false)
    for (const r of RANKS) {
      expect(ranks.has(r)).toBe(true)
    }
  })

  it('todas las cartas son únicas', () => {
    const ids = createDeck().map((c) => c.id)
    expect(new Set(ids).size).toBe(40)
  })
})

describe('shuffle', () => {
  it('mantiene las mismas cartas y no muta el original', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck, () => 0.5)
    expect(shuffled).toHaveLength(40)
    expect(new Set(shuffled.map((c) => c.id))).toEqual(new Set(deck.map((c) => c.id)))
    expect(deck).toHaveLength(40)
  })

  it('produce un orden distinto con un rng determinista', () => {
    const deck = createDeck()
    const a = shuffle(deck, () => 0.1)
    const b = shuffle(deck, () => 0.9)
    expect(a.map((c) => c.id)).not.toEqual(b.map((c) => c.id))
  })
})
