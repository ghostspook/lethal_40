// Persistencia local (localStorage). Sin backend.
// Los datos son pequeños, así que localStorage es suficiente (5 MB).

const KEYS = {
  settings: 'cuarenta.settings',
  stats: 'cuarenta.stats',
  history: 'cuarenta.history',
  gameState: 'cuarenta.gameState',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Almacenamiento no disponible o lleno: ignorar.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignorar
  }
}

/* === Ajustes === */

export const DEFAULT_SETTINGS = { sound: true, aiDelay: 900 }

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }
}

export function saveSettings(settings) {
  write(KEYS.settings, settings)
}

/* === Estadísticas === */

export const DEFAULT_STATS = { wins: 0, losses: 0, streak: 0 }

export function loadStats() {
  return { ...DEFAULT_STATS, ...read(KEYS.stats, {}) }
}

export function saveStats(stats) {
  write(KEYS.stats, stats)
}

/* === Historial === */

export function loadHistory() {
  return read(KEYS.history, [])
}

export function saveHistory(history) {
  write(KEYS.history, history)
}

export function appendHistory(entry) {
  const history = loadHistory()
  history.unshift(entry)
  saveHistory(history.slice(0, 50))
}

/* === Partida en curso (reanudar) === */

export function saveGame(state) {
  if (!state) return
  // JSON.stringify omite las funciones (rng), que se regeneran al cargar.
  write(KEYS.gameState, state)
}

export function loadGame() {
  const state = read(KEYS.gameState, null)
  if (!state || state.phase !== 'playing') return null
  state.rng = Math.random
  return state
}

export function hasSavedGame() {
  return loadGame() !== null
}

export function clearGame() {
  remove(KEYS.gameState)
}
