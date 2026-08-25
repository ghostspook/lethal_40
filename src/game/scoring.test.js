import { describe, it, expect } from 'vitest'
import { capturePoints, cartonPoints } from './scoring.js'
import { makeCard } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

const move = (captured, initial) => ({ captured, initialCaptured: initial })

describe('capturePoints', () => {
  it('caída (captura la carta del rival anterior) = 2', () => {
    const table = [c('3'), c('4'), c('K')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    const last = { card: c('3'), player: 'ai' }
    expect(capturePoints(m, table, last, 0)).toBe(2)
  })

  it('limpia (deja la mesa vacía) = 2', () => {
    const table = [c('3'), c('4')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    expect(capturePoints(m, table, null, 0)).toBe(2)
  })

  it('caída + limpia = 4', () => {
    const table = [c('3'), c('4')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    const last = { card: c('3'), player: 'ai' }
    expect(capturePoints(m, table, last, 0)).toBe(4)
  })

  it('captura sin caída y sin limpia = 0', () => {
    const table = [c('3'), c('4'), c('K')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    expect(capturePoints(m, table, null, 0)).toBe(0)
  })

  it('botar (sin captura) = 0', () => {
    expect(capturePoints(move([], []), [c('5')], null, 0)).toBe(0)
  })

  it('la caída NO aplica si la carta se captura solo por escalera', () => {
    // El rival botó un 5; yo juego un 4 y la escalera arrastra ese 5.
    const table = [c('4'), c('5'), c('6')]
    const m = move([c('4'), c('5'), c('6')], [c('4')]) // inicial: solo el 4 (igual)
    const last = { card: c('5'), player: 'ai' }
    expect(capturePoints(m, table, last, 0)).toBe(2) // solo limpia (no caída)
  })
})

describe('capturePoints — regla del 38', () => {
  it('a 38 la limpia sola se congela (0 puntos)', () => {
    const table = [c('3'), c('4')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    expect(capturePoints(m, table, null, 38)).toBe(0)
  })

  it('a 38 la caída sí puntúa (2)', () => {
    const table = [c('3'), c('4'), c('K')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    const last = { card: c('3'), player: 'ai' }
    expect(capturePoints(m, table, last, 38)).toBe(2)
  })

  it('a 38 la caída + limpia puntúa 4', () => {
    const table = [c('3'), c('4')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    const last = { card: c('3'), player: 'ai' }
    expect(capturePoints(m, table, last, 38)).toBe(4)
  })

  it('por debajo de 38 la limpia sola puntúa 2', () => {
    const table = [c('3'), c('4')]
    const m = move([c('3'), c('4')], [c('3'), c('4')])
    expect(capturePoints(m, table, null, 36)).toBe(2)
  })
})

describe('cartonPoints', () => {
  it('sigue la tabla oficial', () => {
    expect(cartonPoints(18)).toBe(0)
    expect(cartonPoints(19)).toBe(6)
    expect(cartonPoints(20)).toBe(6)
    expect(cartonPoints(21)).toBe(8)
    expect(cartonPoints(22)).toBe(8)
    expect(cartonPoints(23)).toBe(10)
    expect(cartonPoints(24)).toBe(10)
    expect(cartonPoints(25)).toBe(12)
    expect(cartonPoints(26)).toBe(12)
  })
})
