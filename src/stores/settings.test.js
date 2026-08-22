import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './settings.js'
import { loadSettings } from '../services/storage.js'

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('carga valores por defecto', () => {
    const settings = useSettingsStore()
    expect(settings.sound).toBe(true)
    expect(settings.aiDelay).toBe(900)
  })

  it('persiste los cambios en storage', () => {
    const settings = useSettingsStore()
    settings.setSound(false)
    settings.setAiDelay(500)

    expect(loadSettings()).toEqual({ sound: false, aiDelay: 500 })
  })
})
