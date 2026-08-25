<script setup>
import { capturePoints } from '../game/scoring.js'

const props = defineProps({
  card: { type: Object, required: true },
  moves: { type: Array, required: true },
  table: { type: Array, required: true },
  lastThrownCard: { type: Object, default: null },
  score: { type: Number, default: 0 },
})

const emit = defineEmits(['select'])

function label(move) {
  if (move.captured.length === 0) return 'Botar la carta'
  const initial = move.initialCaptured || []
  const chain = move.captured.filter((c) => !initial.some((i) => i.id === c.id))
  const isIgual = initial.length > 0 && initial.every((c) => c.rank === move.card.rank)

  let text = isIgual
    ? `Igual (${initial.map((c) => c.rank).join(', ')})`
    : `Suma ${initial.map((c) => c.rank).join(' + ')} = ${move.card.rank}`
  if (chain.length > 0) text += ` → escalera (${chain.map((c) => c.rank).join(', ')})`
  return `Llevarse ${text}`
}

function points(move) {
  return move.captured.length === 0
    ? 0
    : capturePoints(move, props.table, props.lastThrownCard, props.score)
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
