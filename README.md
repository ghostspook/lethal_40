# Cuarenta 40

Aplicación web progresiva (PWA) para jugar **Cuarenta (40)**, el juego de cartas ecuatoriano, contra el dispositivo. 100% frontend, sin backend.

## Requisitos

- Node.js 20+ (probado con Node v24)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build / producción

```bash
npm run build
npm run preview
```

> La PWA (service worker, instalación y offline) se activa con el build servido (`npm run preview` o el hosting), no en `npm run dev`. Para probar la instalación usa `npm run preview`.

## Iconos

Los iconos PWA (192/512/maskable/apple-touch) se generan desde los SVG de `scripts/icons/`:

```bash
npm run generate:icons
```

Requiere `sharp` (dependencia de desarrollo). El resultado se escribe en `public/icons/`.

## Tests

```bash
npm test          # ejecuta la suite una vez
npm run test:watch
```

## Documentación

- Reglas del juego: [`docs/REGLAS.md`](docs/REGLAS.md)
- Plan del proyecto: [`docs/PLAN.md`](docs/PLAN.md)

## Estructura

- `src/game/` — motor del juego (JavaScript puro, sin dependencias de Vue)
- `src/components/` — componentes Vue (carta, mesa, mano, marcador…)
- `src/views/` — pantallas (Inicio, Juego, Ajustes, Estadísticas)
- `src/stores/` — estado de la app (Pinia)
- `src/services/` — persistencia local y audio
