# Reglamento de Cuarenta (40) — App "Cuarenta 40"

Reglas finales confirmadas para la implementación (versión canónica, 2 jugadores: humano vs IA).

## 1. Mazo
- **40 cartas**: mazo internacional de 52 cartas **sin 8, 9 ni 10**.
- Palos: corazones, diamantes, tréboles y picas (los palos no afectan la puntuación).
- Valores:
  - A = 1
  - 2, 3, 4, 5, 6, 7 = su valor nominal
  - J, Q, K = 0

## 2. Jugadores y reparto
- 2 jugadores: Humano vs IA.
- Se reparten **5 cartas** a cada uno, alternando una a una.
- El jugador que **no reparte** juega primero.
- El repartidor alterna en cada nueva barajada.

## 3. Turno de juego
- En su turno, el jugador juega **1 carta** boca arriba a la mesa.
- Puede capturar (opcional):
  - Por **igual**: carta del mismo rango que una de la mesa.
  - Por **suma**: la carta jugada equivale a la suma de los valores de **2 o más** cartas de la mesa.
- Si captura, se lleva la carta jugada y las capturadas (quedan fuera de juego).
- Si no captura, la carta se queda en la mesa ("botar").

## 4. Puntuación
- **Caída**: capturar 2 o más cartas → **+2 puntos**.
- **Limpia**: capturar la ÚNICA carta que queda en la mesa → **+2 puntos**.
- **Ronda** (limpiar la mesa por completo):
  - Capturando 2 o más cartas → caída + ronda = **+4 puntos**.
  - Capturando 1 carta (la última) → es "limpia" = +2 puntos.
- Capturar 1 sola carta **sin** limpiar la mesa → **0 puntos** (regla canónica).

## 5. Regla del 38
- Al llegar exactamente a **38 puntos**, queda **prohibida la jugada de 4 puntos** (caída + ronda, es decir, capturar 2+ cartas limpiando la mesa).
- A 38 puntos el jugador solo puede ganar con:
  - **Caída simple** (2 pts) → llega a 40.
  - **Limpia** (1 carta, 2 pts) → llega a 40.
- Si a 38 la única captura de 2+ cartas implicaría limpiar la mesa, no puede hacerla (debe botar o capturar sin limpiar).

## 6. Victoria
- Gana el primer jugador que llega a **40 puntos**.
- En caso de empate, gana el que tenga **más puntos**.

## 7. Flujo de la partida
- Se juegan las 5 cartas de cada jugador; luego se reparten 5 más del mazo restante.
- Al agotarse el mazo (tras 4 manos), se baraja de nuevo el mazo completo y se reparte, alternando el repartidor.
- Los puntos se acumulan entre barajadas hasta que alguien llega a 40.
- Las cartas sin capturar permanecen en la mesa; las cartas capturadas vuelven al mazo al rebarajar.
