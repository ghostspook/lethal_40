# Reglamento de Cuarenta (40) — App "Cuarenta 40"

Reglas oficiales para la configuración de **2 jugadores** (humano vs IA), implementadas en el motor (`src/game`).

## 1. Mazo (40 cartas)
- Mazo internacional de 52 cartas **sin 8, 9 ni 10** → 40 cartas.
- Palos: corazones, diamantes, tréboles y picas (no afectan la puntuación).
- Valores:
  - A = 1
  - 2, 3, 4, 5, 6, 7 = su valor nominal
  - J, Q, K = sin valor de suma (identificadores 11, 12 y 13)

## 2. Secuencia / Escalera (`sequence_order`)
Orden estricto de ascenso para las capturas consecutivas:

```
A(1) → 2 → 3 → 4 → 5 → 6 → 7 → J(11) → Q(12) → K(13)
```

Del `7` se salta directamente a la `J`; la `K` es el tope.

## 3. Jugadores y reparto
- 2 jugadores: Humano vs IA.
- Por chica se juegan **4 dadas de 10 cartas** (5 cartas por jugador) = 40 cartas.
- Se reparten 5 cartas continuas a cada jugador; el que **no reparte** juega primero.
- El repartidor **alterna en cada dada**.

## 4. Anuncios de mano (Ronda / Doble Ronda)
Se evalúan al inicio de cada dada, antes de la primera jugada:

| Evento | Condición | Puntos |
|---|---|---|
| Ronda | 3 cartas del mismo rango | +2 |
| Doble Ronda | 4 cartas del mismo rango | +4 |

- **Regla >30:** si el equipo acumuló **más de 30 puntos**, no se acredita Ronda ni Doble Ronda.
- Se acreditan inmediatamente al iniciar el turno del primer jugador de la dada.

## 5. Turno de juego
- En su turno, el jugador juega **1 carta** a la mesa.
- Captura (opcional), en este orden de evaluación:
  1. **Igualdad:** la carta jugada captura **todas** las cartas del mismo rango presentes en la mesa.
  2. **Suma (solo 1–7):** combinaciones de **2 o más** cartas (rango 1–7) cuya suma iguale el valor de la carta jugada. J, Q y K **nunca** forman ni reciben sumas.
  3. **Escalera / secuencia (efecto dominó):** tras una captura inicial (igualdad o suma), se captura automáticamente el rango inmediatamente superior al de mayor rango capturado, encadenando hasta que se rompa la secuencia.
- Si no captura, la carta se queda en la mesa ("botar").

## 6. Puntuación de jugada

| Evento | Condición | Puntos |
|---|---|---|
| Caída | La carta jugada captura la carta lanzada por el jugador inmediatamente anterior (por igualdad o por suma que la contenga; **no** por escalera) | +2 |
| Limpia | La captura deja la mesa completamente vacía | +2 |
| Caída y Limpia | Ambas a la vez | +4 |

- Captura sin caída y sin limpia → **0 puntos**.

## 7. Regla del 38 ("38 que no juega")
- Al alcanzar **38 o 39 puntos**, el equipo **no** suma por: cartón, Ronda/Doble Ronda ni Limpia sola.
- La **única** forma de llegar a 40 es mediante una **Caída** (o Caída y Limpia).

## 8. Fin de ciclo (40 cartas agotadas)
Al agotarse las 40 cartas del mazo:
1. Las cartas sobrantes en la mesa pasan al pozo del **último capturador** (sin activar Caída ni Limpia).
2. Se calcula el **cartón** por equipo:

| Cartas recolectadas | Puntos |
|---|---|
| ≤ 18 | 0 |
| 19 o 20 | 6 |
| 21 o 22 | 8 |
| 23 o 24 | 10 |
| 25 o 26 | 12 |
| N impar (≥21) | 6 + (N + 1 − 20) |

3. **Dos por dar:** si hay empate de cartones (o nadie llega a 19), nadie suma cartón y el siguiente repartidor recibe **+2**.
4. **Dos por falla:** si un equipo termina con 0 cartas capturadas, el rival recibe **+2**.
5. Si nadie llegó a 40, se rebaraja todo y se continúa la chica.

## 9. Victoria y Zapatería
- Gana la chica el primero en llegar a **40 puntos**.
- **Zapatería:** si al ganar, el rival tiene **menos de 10 puntos**, el perdedor queda registrado como "zapatero".

## Notas de implementación
- La estructura de *partida* (mejor de 3 chicas) queda **fuera de alcance por ahora**: se juega una sola chica a 40.
- El motor es JavaScript puro (sin Vue); los rangos se representan como strings (`'A'`, `'2'`…`'7'`, `'J'`, `'Q'`, `'K'`) y el orden de secuencia vive en `RANK_ORDER`.
