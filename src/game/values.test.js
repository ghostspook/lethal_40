import { describe, it, expect } from 'vitest'
import { cardValue, RANKS, SUITS, makeCard, otherPlayer } from './values.js'

describe('cardValue', () => {
  it('el As vale 1', () => {
    expect(cardValue('A')).toBe(1)
  })

  it('las cartas 2..7 valen su número', () => {
    for (let n = 2; n <= 7; n++) {
      expect(cardValue(String(n))).toBe(n)
    }
  })

  it('J, Q y K valen 0', () => {
    expect(cardValue('J')).toBe(0)
    expect(cardValue('Q')).toBe(0)
    expect(cardValue('K')).toBe(0)
  })
})

describe('makeCard y otherPlayer', () => {
  it('crea una carta con id único', () => {
    const card = makeCard('A', 'hearts')
    expect(card).toEqual({ id: 'A-hearts', rank: 'A', suit: 'hearts' })
  })

  it('otherPlayer alterna entre jugadores', () => {
    expect(otherPlayer('human')).toBe('ai')
    expect(otherPlayer('ai')).toBe('human')
  })

  it('el mazo usa 4 palos y 10 rangos', () => {
    expect(SUITS).toHaveLength(4)
    expect(RANKS).toHaveLength(10)
  })
})
