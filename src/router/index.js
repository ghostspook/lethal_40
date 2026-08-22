import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/juego', name: 'game', component: () => import('../views/GameView.vue') },
  { path: '/ajustes', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/estadisticas', name: 'stats', component: () => import('../views/StatsView.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
