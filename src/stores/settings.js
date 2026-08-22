import { defineStore } from 'pinia'
import { loadSettings, saveSettings } from '../services/storage.js'

export const useSettingsStore = defineStore('settings', {
  state: () => loadSettings(),

  actions: {
    setSound(value) {
      this.sound = value
      this.persist()
    },
    setAiDelay(value) {
      this.aiDelay = value
      this.persist()
    },
    persist() {
      saveSettings({ sound: this.sound, aiDelay: this.aiDelay })
    },
  },
})
