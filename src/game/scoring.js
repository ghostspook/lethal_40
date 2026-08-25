/**
 * Puntos de una captura según el reglamento oficial (2 jugadores):
 * - Caída (captura la carta botada por el jugador inmediatamente anterior): +2.
 * - Limpia (la captura deja la mesa completamente vacía): +2.
 * - Caída + Limpia (ambas a la vez): +4.
 * - Ninguna de las dos: 0.
 *
 * Regla del 38: a 38/39 puntos solo puntúa la caída; la limpia sola se congela.
 *
 * `move` = `{ captured, initialCaptured }`; `table` es la mesa ANTES de capturar.
 * `initialCaptured` son las cartas capturadas directamente (igualdad/suma),
 * sin contar la escalera (la caída solo aplica por igualdad o suma, no por escalera).
 */
export function capturePoints(move, table, lastThrownCard, score = 0) {
  const captured = move.captured || []
  if (captured.length === 0) return 0

  const initial = move.initialCaptured || []
  const cleared = captured.length === table.length
  const caida =
    Boolean(lastThrownCard) && initial.some((c) => c.id === lastThrownCard.card.id)

  if (score >= 38 && !caida) return 0

  let points = 0
  if (caida) points += 2
  if (cleared) points += 2
  return points
}

/**
 * Puntos de cartón según la tabla oficial (redondeo al número par superior).
 * ≤18 → 0; 19-20 → 6; 21-22 → 8; 23-24 → 10; 25-26 → 12; etc.
 */
export function cartonPoints(n) {
  if (n <= 18) return 0
  if (n <= 20) return 6
  const effective = n % 2 === 0 ? n : n + 1
  return 6 + (effective - 20)
}
