import { defineStore } from 'pinia'
import { loadStats, loadHistory, saveStats, saveHistory } from '../services/storage.js'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    stats: loadStats(),
    history: loadHistory(),
  }),

  getters: {
    totalGames: (s) => s.stats.wins + s.stats.losses,
  },

  actions: {
    recordGame({ result, humanScore, aiScore, zapatero = null }) {
      const stats = { ...this.stats }

      if (result === 'win') {
        stats.wins += 1
        stats.streak = stats.streak >= 0 ? stats.streak + 1 : 1
      } else {
        stats.losses += 1
        stats.streak = stats.streak <= 0 ? stats.streak - 1 : -1
      }

      this.stats = stats
      saveStats(stats)

      this.history = [
        { date: new Date().toISOString(), result, humanScore, aiScore, zapatero },
        ...this.history,
      ].slice(0, 50)
      saveHistory(this.history)
    },
  },
})
