import { describe, it, expect } from 'vitest'
import { capturePoints, isAllowedBy38 } from './scoring.js'
import { makeCard } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

describe('capturePoints', () => {
  it('caída (2+ cartas sin limpiar la mesa) = 2', () => {
    expect(capturePoints([c('3'), c('4')], [c('3'), c('4'), c('5')])).toBe(2)
  })

  it('limpia (única carta de la mesa) = 2', () => {
    expect(capturePoints([c('5')], [c('5')])).toBe(2)
  })

  it('caída + ronda (2+ cartas limpiando la mesa) = 4', () => {
    expect(capturePoints([c('3'), c('4')], [c('3'), c('4')])).toBe(4)
  })

  it('una carta sin limpiar la mesa = 0', () => {
    expect(capturePoints([c('5')], [c('5'), c('6')])).toBe(0)
  })

  it('botar (sin captura) = 0', () => {
    expect(capturePoints([], [c('5')])).toBe(0)
  })
})

describe('isAllowedBy38', () => {
  it('a 38 puntos prohíbe la jugada de 4', () => {
    expect(isAllowedBy38([c('3'), c('4')], [c('3'), c('4')], 38)).toBe(false)
  })

  it('a 38 puntos permite la caída simple', () => {
    expect(isAllowedBy38([c('3'), c('4')], [c('3'), c('4'), c('5')], 38)).toBe(true)
  })

  it('a 38 puntos permite la limpia', () => {
    expect(isAllowedBy38([c('5')], [c('5')], 38)).toBe(true)
  })

  it('fuera de 38 permite la jugada de 4', () => {
    expect(isAllowedBy38([c('3'), c('4')], [c('3'), c('4')], 36)).toBe(true)
    expect(isAllowedBy38([c('3'), c('4')], [c('3'), c('4')], 0)).toBe(true)
  })
})
