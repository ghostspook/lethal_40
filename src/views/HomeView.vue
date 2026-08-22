<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { hasSavedGame } from '../services/storage.js'
import { usePwaInstall } from '../composables/usePwaInstall.js'

const router = useRouter()
const store = useGameStore()
const canResume = ref(hasSavedGame())
const { canInstall, isIos, install } = usePwaInstall()

function jugar() {
  store.startGame()
  router.push('/juego')
}

function continuar() {
  if (store.resumeGame()) router.push('/juego')
}
</script>

<template>
  <main class="home-view">
    <h1 class="home-view__title">Cuarenta 40</h1>
    <p class="home-view__subtitle">Juego de cartas ecuatoriano contra el dispositivo</p>

    <div class="home-view__menu">
      <button class="btn" @click="jugar">Jugar</button>
      <button v-if="canResume" class="btn" @click="continuar">Continuar partida</button>
      <RouterLink to="/estadisticas" class="btn btn--ghost">Estadísticas</RouterLink>
      <RouterLink to="/ajustes" class="btn btn--ghost">Ajustes</RouterLink>
    </div>

    <button v-if="canInstall" class="btn btn--ghost" @click="install">Instalar app</button>
    <p v-else-if="isIos" class="home-view__hint">
      Para instalar: en Safari toca <strong>Compartir</strong> →
      <strong>Agregar a pantalla de inicio</strong>.
    </p>
  </main>
</template>
