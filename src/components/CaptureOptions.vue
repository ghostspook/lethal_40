<script setup>
import { capturePoints } from '../game/scoring.js'

const props = defineProps({
  card: { type: Object, required: true },
  moves: { type: Array, required: true },
  table: { type: Array, required: true },
})

const emit = defineEmits(['select'])

function label(move) {
  if (move.captured.length === 0) return 'Botar la carta'
  if (move.captured.length === 1) return `Llevarse ${move.captured[0].rank} (igual)`
  return `Llevarse ${move.captured.map((c) => c.rank).join(' + ')} = ${move.card.rank}`
}

function points(move) {
  return move.captured.length === 0 ? 0 : capturePoints(move.captured, props.table)
}
</script>

<template>
  <div class="capture-options">
    <button
      v-for="(move, i) in moves"
      :key="i"
      class="capture-options__btn"
      @click="emit('select', move)"
    >
      <span>{{ label(move) }}</span>
      <span v-if="points(move) > 0" class="capture-options__pts">+{{ points(move) }}</span>
    </button>
  </div>
</template>
