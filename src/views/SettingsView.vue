<script setup>
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '../stores/settings.js'

const settings = useSettingsStore()
</script>

<template>
  <main class="home-view">
    <h1 class="home-view__title">Ajustes</h1>

    <div class="settings">
      <label class="settings__row">
        <span>Sonido</span>
        <input
          type="checkbox"
          :checked="settings.sound"
          @change="settings.setSound($event.target.checked)"
        />
      </label>

      <label class="settings__row">
        <span>Velocidad de la máquina</span>
        <select :value="settings.aiDelay" @change="settings.setAiDelay(Number($event.target.value))">
          <option :value="500">Rápida</option>
          <option :value="900">Normal</option>
          <option :value="1600">Lenta</option>
        </select>
      </label>
    </div>

    <RouterLink to="/" class="btn btn--ghost">Volver</RouterLink>
  </main>
</template>
