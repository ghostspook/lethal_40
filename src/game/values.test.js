import { describe, it, expect } from 'vitest'
import {
  cardValue,
  RANKS,
  SUITS,
  makeCard,
  otherPlayer,
  rankOrder,
  nextRank,
} from './values.js'

describe('cardValue', () => {
  it('el As vale 1', () => {
    expect(cardValue('A')).toBe(1)
  })

  it('las cartas 2..7 valen su número', () => {
    for (let n = 2; n <= 7; n++) {
      expect(cardValue(String(n))).toBe(n)
    }
  })

  it('J, Q y K valen 0 (sin valor de suma)', () => {
    expect(cardValue('J')).toBe(0)
    expect(cardValue('Q')).toBe(0)
    expect(cardValue('K')).toBe(0)
  })
})

describe('rankOrder y nextRank (escalera)', () => {
  it('ordena As < 2 < … < 7 < J < Q < K', () => {
    const order = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K']
    for (let i = 1; i < order.length; i++) {
      expect(rankOrder(order[i])).toBeGreaterThan(rankOrder(order[i - 1]))
    }
  })

  it('del 7 salta directamente a la J', () => {
    expect(nextRank('7')).toBe('J')
  })

  it('la K es el tope (nextRank devuelve null)', () => {
    expect(nextRank('K')).toBeNull()
  })

  it('nextRank sigue el orden completo', () => {
    expect(nextRank('A')).toBe('2')
    expect(nextRank('J')).toBe('Q')
    expect(nextRank('Q')).toBe('K')
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
