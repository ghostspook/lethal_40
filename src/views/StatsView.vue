<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useStatsStore } from '../stores/stats.js'

const stats = useStatsStore()

const streakLabel = computed(() => {
  const s = stats.stats.streak
  if (s === 0) return 'Sin racha'
  return s > 0 ? `${s} victorias seguidas` : `${-s} derrotas seguidas`
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}
</script>

<template>
  <main class="home-view">
    <h1 class="home-view__title">Estadísticas</h1>

    <div class="stats">
      <div class="stats__grid">
        <div class="stats__box">
          <strong>{{ stats.stats.wins }}</strong>
          <span>Victorias</span>
        </div>
        <div class="stats__box">
          <strong>{{ stats.stats.losses }}</strong>
          <span>Derrotas</span>
        </div>
        <div class="stats__box">
          <strong>{{ stats.totalGames }}</strong>
          <span>Partidas</span>
        </div>
      </div>
      <div class="stats__streak">{{ streakLabel }}</div>
    </div>

    <template v-if="stats.history.length">
      <h2 class="stats__subtitle">Últimas partidas</h2>
      <ul class="stats__history">
        <li v-for="(g, i) in stats.history" :key="i" class="stats__entry">
          <span>{{ formatDate(g.date) }}</span>
          <span :class="g.result === 'win' ? 'win' : 'loss'">
            {{ g.result === 'win' ? 'Victoria' : 'Derrota' }}
          </span>
          <span>{{ g.humanScore }} – {{ g.aiScore }}</span>
        </li>
      </ul>
    </template>

    <RouterLink to="/" class="btn btn--ghost">Volver</RouterLink>
  </main>
</template>
