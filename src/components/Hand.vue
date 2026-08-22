<script setup>
import Card from './Card.vue'

defineProps({
  cards: { type: Array, required: true },
  selectedId: { type: String, default: null },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="hand" :class="{ 'hand--disabled': disabled }">
    <Card
      v-for="card in cards"
      :key="card.id"
      :card="card"
      :selectable="!disabled"
      :selected="card.id === selectedId"
      @click="emit('select', card)"
    />
  </div>
</template>
