# Plan: "Cuarenta 40" — PWA de Cuarenta contra el dispositivo

> Estado: reglas confirmadas (ver [`REGLAS.md`](./REGLAS.md)). Fase 0 completada.

## 1. Objetivo

Aplicación **100% frontend** (sin backend) para jugar **Cuarenta (40)** contra el dispositivo móvil, **instalable como PWA** en Android e iOS ("Agregar a pantalla de inicio"), sin pasar por tiendas de apps. Desarrollada con **Vue 3 + Vite + JavaScript**.

## 2. Decisiones confirmadas

| Tema | Decisión |
|------|----------|
| Reglas | Cuarenta ecuatoriana estándar de 2 jugadores (ver `docs/REGLAS.md`) |
| Modo | Solo 1 jugador humano vs IA |
| IA | Un solo nivel equilibrado (motor heurístico) |
| Stack | Vue 3 + Vite + JavaScript |
| UI | Tema ecuatoriano colorido, cartas SVG, Tailwind CSS |
| Assets | SVG propios/open-source + sonidos básicos |
| Persistencia | Partida en curso + historial + estadísticas + ajustes (localStorage/IndexedDB) |
| Idioma | Solo español |
| Despliegue | Hosting estático (ver §10) |

## 3. Reglas del juego

Reglamento cerrado en [`docs/REGLAS.md`](./REGLAS.md). Resumen:

- Mazo de 40 cartas (52 sin 8, 9, 10); A=1, 2–7 nominal, J/Q/K=0. Mazo internacional (♥♦♣♠).
- 2 jugadores, 5 cartas cada uno; el que no reparte juega primero.
- Capturas por **igual** o por **suma** (2+ cartas).
- Puntuación: **caída** (2+ cartas) = 2 pts; **limpia** (última carta) = 2 pts; **ronda** (limpiar la mesa) = +2 (caída+ronda = 4 pts si captura 2+ cartas). Capturar 1 carta sin limpiar = 0 pts.
- **Regla del 38**: a 38 puntos se prohíbe la jugada de 4 pts; solo gana con caída simple o limpia.
- Gana el primero en llegar a 40; empate → más puntos.

## 4. Arquitectura técnica

**Principio clave**: separar la **lógica del juego (motor)** de la **capa de presentación (Vue)**. El motor es JavaScript puro, sin dependencias de Vue → testeable.

- **Vue 3** (Composition API, `<script setup>`) + **Vite**
- **Pinia** (estado), **Vue Router** (pantallas)
- **Tailwind CSS** (estilo)
- **vite-plugin-pwa** (manifest + service worker con Workbox → instalable y offline)
- **localStorage + IndexedDB** (persistencia local)
- **Vitest** (tests unitarios del motor y de la IA)

### Estructura del proyecto
```
lethal_40/
├── index.html
├── vite.config.js            # plugin PWA + Tailwind
├── vitest.config.js
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons/                # 192, 512, maskable (Fase 6)
├── docs/
│   ├── REGLAS.md
│   └── PLAN.md
└── src/
    ├── main.js
    ├── App.vue
    ├── router/
    ├── stores/               # Pinia (game, settings, stats)
    ├── game/                 # MOTOR — JS puro, sin Vue
    │   ├── deck.js
    │   ├── values.js
    │   ├── captures.js
    │   ├── scoring.js
    │   ├── engine.js
    │   └── ai.js
    ├── components/           # Card.vue, Table.vue, Hand.vue, Scoreboard.vue, CaptureOptions.vue
    ├── views/                # HomeView, GameView, SettingsView, StatsView
    ├── services/             # storage.js, audio.js
    ├── assets/               # SVG de cartas, mesa, sonidos
    └── styles/               # main.css (Tailwind)
```

### Máquina de estados del juego (`engine.js`)
`configurar → repartir → turnoHumano → resolverCaptura → turnoIA → resolverCaptura → finDeMano (re-repartir) → finDePartida (40 pts)`.

Cada acción produce un **nuevo estado inmutable** que Vue renderiza (serializable → reanudar partida).

## 5. IA (un nivel equilibrado)

Motor de **reglas heurísticas** (un modelo de ML pesado no es viable en frontend):
1. Evalúa todas las capturas legales y prioriza las que **puntúan** (caída/ronda/limpia).
2. Prefiere capturar **cartas de alto valor** y despejar la mesa (ronda) cuando conviene.
3. Si captura por suma, prefiere la combinación que deje **menos cartas** en la mesa.
4. Si **no captura**, "bota" la carta que minimice las capturas fáciles del rival; prefiere J/Q/K (valor 0).
5. Introduce **algo de aleatoriedad** entre jugadas casi equivalentes.

## 6. Capa de presentación (Vue)

- **HomeView**: título, "Jugar", "Continuar partida", ajustes, estadísticas.
- **GameView**: mesa con cartas capturables resaltadas, mano, marcador, indicador de turno, historial.
- Interacción táctil (tap/clic), selector de opciones de captura, animaciones (velocidad configurable).
- **Responsive** en retrato y paisaje.

## 7. Persistencia (todo local, sin backend)

- `cuarenta.gameState` → instantánea para **reanudar**.
- `cuarenta.stats` → victorias/derrotas, puntos, racha.
- `cuarenta.history` → últimas partidas (fecha, resultado, puntos).
- `cuarenta.settings` → sonido, animaciones, velocidad de la IA, tema.

## 8. PWA (instalable y offline)

- **Web App Manifest**: nombre, iconos (192/512 + maskable), color de tema, `display: standalone`.
- **Service Worker (Workbox)**: precachea el build → offline.
- **Instalación**: botón "Instalar" + instrucciones iOS.
- Verificación con **Lighthouse (PWA)** y prueba real en Android e iOS.

## 9. Fases de implementación

| Fase | Contenido | Entregable | Estado |
|------|-----------|------------|--------|
| **0** | Confirmar reglas y estilo de cartas | Reglamento cerrado (`REGLAS.md`) | ✅ |
| **1** | Scaffold: Vite + Vue 3 + PWA + Tailwind + Pinia + Router | App corre en `dev` | 🔄 |
| **2** | Motor de juego completo (mazo, capturas, scoring, turnos) | Motor + tests Vitest | ⬜ |
| **3** | IA heurística | Oponente jugable | ⬜ |
| **4** | UI/Vue (pantallas y componentes) + animaciones | Juego jugable en navegador | ⬜ |
| **5** | Persistencia (reanudar, historial, estadísticas, ajustes) | Datos guardados | ⬜ |
| **6** | PWA: manifest, iconos, service worker, instalación | Instalable y offline | ⬜ |
| **7** | Assets finales (SVG cartas, mesa, sonidos) y pulido visual | Look "ecuatoriano" | ⬜ |
| **8** | QA: tests unitarios + pruebas manuales Android/iOS + Lighthouse | Estable | ⬜ |
| **9** | Build de producción + despliegue + guía de instalación | URL instalable | ⬜ |

## 10. Despliegue (sin backend)

- Build estático (`vite build`) servido en **GitHub Pages / Netlify / Vercel**.
- **HTTPS obligatorio** (requisito para service worker e instalación).
- Entregable final: URL + instrucciones para "instalar" en Android e iOS.

## 11. Fuera de alcance (MVP) — ampliables después

Multijugador online, modo 2 jugadores pass-and-play, niveles de IA, i18n, variantes de reglas (perico/perica), marcadores online.
