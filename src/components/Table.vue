<script setup>
import Card from './Card.vue'

defineProps({
  cards: { type: Array, required: true },
  highlightIds: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="table">
    <p v-if="cards.length === 0" class="table__empty">La mesa está vacía</p>
    <div v-else class="table__cards">
      <Card
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :highlight="highlightIds.includes(card.id)"
      />
    </div>
  </div>
</template>
