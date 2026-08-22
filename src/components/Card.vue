<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: { type: Object, required: true },
  faceDown: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  highlight: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }

const isRed = computed(() => props.card.suit === 'hearts' || props.card.suit === 'diamonds')
const suitSymbol = computed(() => SUIT_SYMBOLS[props.card.suit] ?? '')
</script>

<template>
  <div
    class="card"
    :class="[
      isRed ? 'card--red' : 'card--black',
      {
        'card--small': small,
        'card--selectable': selectable,
        'card--selected': selected,
        'card--highlight': highlight,
        'card--back': faceDown,
      },
    ]"
    @click="emit('click')"
  >
    <template v-if="faceDown">
      <span class="card__back-mark">✦</span>
    </template>
    <template v-else>
      <div class="card__corner card__corner--tl">
        {{ card.rank }}<br /><span class="card__corner-suit">{{ suitSymbol }}</span>
      </div>
      <div class="card__center">
        <span class="card__center-rank">{{ card.rank }}</span>
        <span class="card__center-suit">{{ suitSymbol }}</span>
      </div>
      <div class="card__corner card__corner--br">
        {{ card.rank }}<br /><span class="card__corner-suit">{{ suitSymbol }}</span>
      </div>
    </template>
  </div>
</template>
