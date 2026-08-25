import { describe, it, expect } from 'vitest'
import { getCaptureOptions, isValidCapture } from './captures.js'
import { makeCard, rankOrder } from './values.js'

const c = (rank, suit = 'hearts') => makeCard(rank, suit)

function ranksOf(opt) {
  return opt.captured.map((x) => x.rank).sort((a, b) => rankOrder(a) - rankOrder(b))
}

describe('getCaptureOptions — igualdad', () => {
  it('captura TODAS las cartas del mismo rango', () => {
    const table = [c('5'), c('5', 'diamonds'), c('2')]
    const opts = getCaptureOptions(c('5', 'spades'), table)
    const iguales = opts.filter((o) => o.initialCaptured.every((x) => x.rank === '5'))
    expect(iguales).toHaveLength(1)
    expect(iguales[0].captured).toHaveLength(2)
    expect(ranksOf(iguales[0])).toEqual(['5', '5'])
  })
})

describe('getCaptureOptions — suma', () => {
  it('captura por suma dos o más cartas', () => {
    const table = [c('3'), c('4'), c('2')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    const sumas = opts.filter((o) => o.initialCaptured.length >= 2)
    expect(sumas).toHaveLength(1)
    expect(ranksOf(sumas[0])).toEqual(['3', '4'])
  })

  it('el As no captura por suma', () => {
    const table = [c('A'), c('3'), c('4')]
    const opts = getCaptureOptions(c('A', 'spades'), table)
    expect(opts).toHaveLength(1)
    expect(ranksOf(opts[0])).toEqual(['A'])
  })

  it('las figuras solo capturan por igual', () => {
    const table = [c('K'), c('Q'), c('3')]
    const opts = getCaptureOptions(c('K', 'diamonds'), table)
    expect(opts).toHaveLength(1)
    expect(ranksOf(opts[0])).toEqual(['K'])
  })

  it('deduplica sumas equivalentes (mismo multiconjunto de rangos)', () => {
    const table = [c('3', 'hearts'), c('3', 'diamonds'), c('4')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    const sumas = opts.filter((o) => o.initialCaptured.length >= 2)
    expect(sumas).toHaveLength(1)
  })
})

describe('getCaptureOptions — escalera', () => {
  it('tras capturar 3 encadena 4 y 5, frenando en 6', () => {
    const table = [c('3'), c('4'), c('5'), c('7'), c('J')]
    const opts = getCaptureOptions(c('3', 'spades'), table)
    const igual = opts.find((o) => o.initialCaptured.length === 1 && o.initialCaptured[0].rank === '3')
    expect(ranksOf(igual)).toEqual(['3', '4', '5'])
  })

  it('tras capturar 5 encadena 6 y 7 (del 7 no salta a J sin 6)', () => {
    const table = [c('5'), c('5', 'diamonds'), c('6'), c('7')]
    const opts = getCaptureOptions(c('5', 'spades'), table)
    expect(ranksOf(opts[0])).toEqual(['5', '5', '6', '7'])
  })

  it('las figuras también escalan (J → Q → K)', () => {
    const table = [c('J'), c('J', 'diamonds'), c('Q'), c('K')]
    const opts = getCaptureOptions(c('J', 'spades'), table)
    expect(ranksOf(opts[0])).toEqual(['J', 'J', 'Q', 'K'])
  })

  it('la escalera también parte de una captura por suma', () => {
    const table = [c('3'), c('4'), c('5'), c('6')]
    const opts = getCaptureOptions(c('7', 'spades'), table)
    // 7 = 3 + 4 → escalera 5, 6
    const suma = opts.find((o) => o.initialCaptured.length >= 2)
    expect(ranksOf(suma)).toEqual(['3', '4', '5', '6'])
  })
})

describe('isValidCapture', () => {
  const move = (captured, initial) => ({ card: null, captured, initialCaptured: initial })

  it('acepta botar (sin captura)', () => {
    expect(isValidCapture(c('5'), move([], []), [c('5')])).toBe(true)
  })

  it('acepta capturar por igual (todas del mismo rango)', () => {
    const t = [c('5'), c('5', 'diamonds')]
    expect(isValidCapture(c('5'), move(t, t), t)).toBe(true)
  })

  it('rechaza capturar solo una de varias cartas del mismo rango', () => {
    const table = [c('5'), c('5', 'diamonds')]
    const solo = [c('5')]
    expect(isValidCapture(c('5'), move(solo, solo), table)).toBe(false)
  })

  it('acepta una suma correcta (con escalera)', () => {
    const table = [c('3'), c('4'), c('5')]
    const captured = [c('3'), c('4'), c('5')]
    expect(isValidCapture(c('7'), move(captured, [c('3'), c('4')]), table)).toBe(true)
  })

  it('rechaza una suma incorrecta', () => {
    const table = [c('3'), c('3')]
    const captured = [c('3'), c('3')]
    expect(isValidCapture(c('7'), move(captured, captured), table)).toBe(false)
  })

  it('rechaza capturar cartas que no están en la mesa', () => {
    const table = [c('3'), c('2')]
    const captured = [c('3'), c('4')]
    expect(isValidCapture(c('7'), move(captured, captured), table)).toBe(false)
  })

  it('rechaza capturar figuras por suma', () => {
    const table = [c('J'), c('Q')]
    expect(isValidCapture(c('K'), move([c('J'), c('Q')], [c('J'), c('Q')]), table)).toBe(false)
  })
})
