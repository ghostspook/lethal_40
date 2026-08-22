import { cardValue } from './values.js'

/**
 * Devuelve todas las opciones de captura para una carta jugada sobre una mesa.
 * Cada opción es un arreglo de cartas de la mesa (puede ser una sola por "igual"
 * o varias por "suma"). Las opciones equivalentes (mismo multiconjunto de rangos)
 * se deduplican.
 */
export function getCaptureOptions(card, table) {
  const options = []
  const seen = new Set()

  // Por igual: una carta del mismo rango.
  const match = table.find((t) => t.rank === card.rank)
  if (match) {
    seen.add(`igual:${card.rank}`)
    options.push([match])
  }

  // Por suma: subconjuntos de 2+ cartas (valores positivos) que suman el valor.
  const target = cardValue(card.rank)
  if (target > 0) {
    const items = table
      .map((c) => ({ card: c, value: cardValue(c.rank) }))
      .filter((x) => x.value > 0)

    for (const subset of enumerateSubsets(items, target)) {
      const key = `suma:${subset.map((x) => x.card.rank).sort().join(',')}`
      if (seen.has(key)) continue
      seen.add(key)
      options.push(subset.map((x) => x.card))
    }
  }

  return options
}

function enumerateSubsets(items, target) {
  const results = []
  const chosen = []

  function rec(start, sum) {
    if (sum === target && chosen.length >= 2) {
      results.push(chosen.slice())
      return
    }
    if (sum > target) return
    for (let i = start; i < items.length; i++) {
      const item = items[i]
      if (sum + item.value > target) continue
      chosen.push(item)
      rec(i + 1, sum + item.value)
      chosen.pop()
    }
  }

  rec(0, 0)
  return results
}

/**
 * Valida que una captura sea legal:
 * - `captured` vacío → es "botar" (siempre válido).
 * - 1 carta → solo por "igual" (mismo rango).
 * - 2+ cartas → por "suma" (todas con valor positivo y sumando el valor de la carta).
 * - Todas deben estar en la mesa y sin duplicados.
 */
export function isValidCapture(card, captured, table) {
  if (captured.length === 0) return true

  const tableIds = new Set(table.map((c) => c.id))
  if (captured.some((c) => !tableIds.has(c.id))) return false
  if (new Set(captured.map((c) => c.id)).size !== captured.length) return false

  if (captured.length === 1) {
    return captured[0].rank === card.rank
  }

  if (cardValue(card.rank) <= 0) return false
  if (captured.some((c) => cardValue(c.rank) <= 0)) return false
  const sum = captured.reduce((acc, c) => acc + cardValue(c.rank), 0)
  return sum === cardValue(card.rank)
}
