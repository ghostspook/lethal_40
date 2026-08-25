import { cardValue, nextRank, rankOrder } from './values.js'

/**
 * Devuelve todas las opciones de captura para una carta jugada sobre una mesa.
 * Cada opción es `{ initialCaptured, captured }`:
 * - `initialCaptured`: cartas capturadas directamente (por igualdad o por suma).
 * - `captured`: `initialCaptured` + cartas añadidas por el efecto escalera.
 * Las opciones equivalentes (mismo multiconjunto de rangos inicial y final) se deduplican.
 */
export function getCaptureOptions(card, table) {
  const options = []
  const seen = new Set()

  // Por igual: TODAS las cartas del mismo rango (regla oficial).
  const matches = table.filter((t) => t.rank === card.rank)
  if (matches.length > 0) {
    pushOption({ initialCaptured: matches, captured: resolveEscalera(matches, table) }, options, seen)
  }

  // Por suma: subconjuntos de 2+ cartas (valores 1..7) que suman el valor.
  const target = cardValue(card.rank)
  if (target > 0) {
    const items = table
      .map((c) => ({ card: c, value: cardValue(c.rank) }))
      .filter((x) => x.value > 0)

    for (const subset of enumerateSubsets(items, target)) {
      const initial = subset.map((x) => x.card)
      pushOption({ initialCaptured: initial, captured: resolveEscalera(initial, table) }, options, seen)
    }
  }

  return options
}

/**
 * Efecto dominó / escalera: tras una captura inicial, encadena rangos
 * consecutivos superiores presentes en la mesa hasta que se rompa la secuencia.
 */
function resolveEscalera(initial, table) {
  const capturedIds = new Set(initial.map((c) => c.id))
  const captured = initial.slice()

  let max = null
  for (const c of initial) {
    if (max === null || rankOrder(c.rank) > rankOrder(max)) max = c.rank
  }

  let next = max === null ? null : nextRank(max)
  while (next) {
    const found = table.find((t) => t.rank === next && !capturedIds.has(t.id))
    if (!found) break
    captured.push(found)
    capturedIds.add(found.id)
    next = nextRank(next)
  }
  return captured
}

function pushOption(option, options, seen) {
  const key =
    option.initialCaptured.map((c) => c.rank).sort().join(',') +
    '|' +
    option.captured.map((c) => c.rank).sort().join(',')
  if (seen.has(key)) return
  seen.add(key)
  options.push(option)
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
 * Valida que un movimiento de captura sea legal.
 * `move` = `{ card, captured, initialCaptured }`; `captured` vacío = "botar".
 */
export function isValidCapture(card, move, table) {
  const captured = move.captured || []
  if (captured.length === 0) return true

  const tableIds = new Set(table.map((c) => c.id))
  if (captured.some((c) => !tableIds.has(c.id))) return false
  if (new Set(captured.map((c) => c.id)).size !== captured.length) return false

  const capturedIds = new Set(captured.map((c) => c.id))
  if ((move.initialCaptured || []).some((c) => !capturedIds.has(c.id))) return false

  return getCaptureOptions(card, table).some(
    (opt) =>
      sameRanks(opt.captured, captured) &&
      sameRanks(opt.initialCaptured, move.initialCaptured || []),
  )
}

function sameRanks(a, b) {
  if (a.length !== b.length) return false
  const ra = a.map((c) => c.rank).sort()
  const rb = b.map((c) => c.rank).sort()
  return ra.every((r, i) => r === rb[i])
}
