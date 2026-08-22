import { describe, it, expect } from 'vitest'
import { getCaptureOptions, isValidCapture } from './captures.js'
import { makeCard } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

describe('getCaptureOptions', () => {
  it('captura por igual una carta del mismo rango', () => {
    const table = [c('5'), c('2')]
    const opts = getCaptureOptions(c('5', 'diamonds'), table)
    const igual = opts.filter((o) => o.length === 1)
    expect(igual).toHaveLength(1)
    expect(igual[0][0].rank).toBe('5')
  })

  it('captura por suma dos o más cartas', () => {
    const table = [c('3'), c('4'), c('2')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    const sumas = opts.filter((o) => o.length >= 2)
    expect(sumas).toHaveLength(1)
    expect(sumas[0].map((x) => x.rank).sort()).toEqual(['3', '4'])
  })

  it('el As no captura por suma', () => {
    const table = [c('A'), c('3'), c('4')]
    const opts = getCaptureOptions(c('A', 'spades'), table)
    expect(opts).toHaveLength(1)
    expect(opts[0][0].rank).toBe('A')
  })

  it('las figuras solo capturan por igual', () => {
    const table = [c('K'), c('Q'), c('3')]
    const opts = getCaptureOptions(c('K', 'diamonds'), table)
    expect(opts).toHaveLength(1)
    expect(opts[0][0].rank).toBe('K')
  })

  it('genera varias opciones de suma distintas', () => {
    const table = [c('2'), c('3'), c('4'), c('5')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    const sumas = opts.filter((o) => o.length >= 2)
    expect(sumas).toHaveLength(2)
  })

  it('deduplica sumas equivalentes (mismo multiconjunto de rangos)', () => {
    const table = [c('3', 'hearts'), c('3', 'diamonds'), c('4')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    const sumas = opts.filter((o) => o.length >= 2)
    expect(sumas).toHaveLength(1)
  })
})

describe('isValidCapture', () => {
  it('acepta botar (sin captura)', () => {
    expect(isValidCapture(c('5'), [], [c('5')])).toBe(true)
  })

  it('acepta capturar por igual', () => {
    const t = c('5', 'diamonds')
    expect(isValidCapture(c('5'), [t], [t])).toBe(true)
  })

  it('rechaza capturar una carta suelta de distinto rango', () => {
    expect(isValidCapture(c('5'), [c('3')], [c('3')])).toBe(false)
  })

  it('acepta una suma correcta', () => {
    expect(isValidCapture(c('7'), [c('3'), c('4')], [c('3'), c('4')])).toBe(true)
  })

  it('rechaza una suma incorrecta', () => {
    expect(isValidCapture(c('7'), [c('3'), c('3')], [c('3'), c('3')])).toBe(false)
  })

  it('rechaza capturar cartas que no están en la mesa', () => {
    expect(isValidCapture(c('7'), [c('3'), c('4')], [c('3'), c('2')])).toBe(false)
  })

  it('rechaza capturar figuras por suma', () => {
    expect(isValidCapture(c('K'), [c('J'), c('Q')], [c('J'), c('Q')])).toBe(false)
  })
})
