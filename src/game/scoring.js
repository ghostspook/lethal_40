/**
 * Puntos de una captura según el reglamento (docs/REGLAS.md §4):
 * - Caída (2+ cartas sin limpiar la mesa): 2 pts.
 * - Limpia (la única carta de la mesa): 2 pts.
 * - Caída + ronda (2+ cartas limpiando la mesa): 4 pts.
 * - 1 carta sin limpiar la mesa: 0 pts.
 *
 * `table` es la mesa completa ANTES de retirar las cartas capturadas.
 */
export function capturePoints(captured, table) {
  const n = captured.length
  if (n === 0) return 0
  const cleared = n === table.length
  if (n >= 2) return cleared ? 4 : 2
  return cleared ? 2 : 0 // n === 1
}

/**
 * Regla del 38 (docs/REGLAS.md §5): a 38 puntos queda prohibida la jugada
 * de 4 puntos (caída + ronda). Las de 2 (caída simple o limpia) y 0 sí valen.
 */
export function isAllowedBy38(captured, table, score) {
  if (score !== 38) return true
  return capturePoints(captured, table) !== 4
}
