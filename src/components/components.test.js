import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from './Card.vue'
import Hand from './Hand.vue'
import Table from './Table.vue'
import Scoreboard from './Scoreboard.vue'
import CaptureOptions from './CaptureOptions.vue'
import { makeCard } from '../game/values.js'

describe('Card', () => {
  it('muestra el rango', () => {
    const w = mount(Card, { props: { card: makeCard('7', 'hearts') } })
    expect(w.text()).toContain('7')
    expect(w.text()).toContain('♥')
  })

  it('oculta el rango cuando está boca abajo', () => {
    const w = mount(Card, { props: { card: makeCard('7', 'hearts'), faceDown: true } })
    expect(w.text()).not.toContain('7')
  })
})

describe('Hand', () => {
  it('renderiza una carta por cada carta de la mano', () => {
    const w = mount(Hand, {
      props: { cards: [makeCard('A', 'hearts'), makeCard('2', 'spades')] },
    })
    expect(w.findAll('.card')).toHaveLength(2)
  })
})

describe('Table', () => {
  it('muestra un mensaje cuando está vacía', () => {
    const w = mount(Table, { props: { cards: [], highlightIds: [] } })
    expect(w.text()).toContain('vacía')
  })
})

describe('Scoreboard', () => {
  it('muestra los puntajes', () => {
    const w = mount(Scoreboard, { props: { score: { human: 12, ai: 8 } } })
    expect(w.text()).toContain('12')
    expect(w.text()).toContain('8')
  })
})

describe('CaptureOptions', () => {
  it('muestra las opciones de botar y capturar con sus puntos', () => {
    const card = makeCard('7', 'hearts')
    const table = [makeCard('3', 'hearts'), makeCard('4', 'hearts')]
    const moves = [
      { card, captured: [], initialCaptured: [] },
      { card, captured: [table[0], table[1]], initialCaptured: [table[0], table[1]] },
    ]
    const w = mount(CaptureOptions, {
      props: { card, moves, table, lastThrownCard: null, score: 0 },
    })
    expect(w.text()).toContain('Botar')
    expect(w.text()).toContain('Llevarse')
    expect(w.text()).toContain('+2') // limpia (deja la mesa vacía)
  })
})
