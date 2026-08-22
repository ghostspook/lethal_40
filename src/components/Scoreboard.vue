<script setup>
defineProps({
  score: { type: Object, required: true },
  currentPlayer: { type: String, default: null },
  winner: { type: String, default: null },
})
</script>

<template>
  <div class="scoreboard">
    <div class="scoreboard__player" :class="{ active: currentPlayer === 'human' }">
      <span>Tú</span>
      <strong>{{ score.human }}</strong>
    </div>
    <div class="scoreboard__vs">a 40</div>
    <div class="scoreboard__player" :class="{ active: currentPlayer === 'ai' }">
      <span>Máquina</span>
      <strong>{{ score.ai }}</strong>
    </div>
  </div>
</template>
