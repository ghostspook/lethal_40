<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { getLegalMoves } from '../game/index.js'
import Scoreboard from '../components/Scoreboard.vue'
import Table from '../components/Table.vue'
import Hand from '../components/Hand.vue'
import Card from '../components/Card.vue'
import CaptureOptions from '../components/CaptureOptions.vue'

const store = useGameStore()
const selectedCardId = ref(null)

if (!store.game) store.startGame()

const isGameOver = computed(() => store.isGameOver)
const isHumanTurn = computed(() => store.isHumanTurn)

const humanHand = computed(() => store.humanHand)
const aiHand = computed(() => store.aiHand)
const table = computed(() => store.table)

const selectedCard = computed(
  () => humanHand.value.find((c) => c.id === selectedCardId.value) ?? null,
)

const selectedMoves = computed(() => {
  if (!selectedCard.value || !store.game) return []
  return getLegalMoves(store.game).filter((m) => m.card.id === selectedCard.value.id)
})

const highlightedIds = computed(() => {
  const ids = []
  for (const m of selectedMoves.value) {
    for (const c of m.captured) ids.push(c.id)
  }
  return ids
})

// Carta del rival que se puede "caer" (última que botó la máquina).
const caidaTargetId = computed(() => {
  if (!isHumanTurn.value || !store.game?.lastThrownCard) return null
  return store.game.lastThrownCard.player === 'ai' ? store.game.lastThrownCard.card.id : null
})

const tableHighlightIds = computed(() => {
  const ids = [...highlightedIds.value]
  if (caidaTargetId.value) ids.push(caidaTargetId.value)
  return ids
})

function onCardClick(card) {
  if (!isHumanTurn.value || isGameOver.value) return

  const moves = getLegalMoves(store.game).filter((m) => m.card.id === card.id)
  const hasCapture = moves.some((m) => m.captured.length > 0)

  if (!hasCapture) {
    store.playMove({ card, captured: [], initialCaptured: [] })
    selectedCardId.value = null
  } else {
    selectedCardId.value = selectedCardId.value === card.id ? null : card.id
  }
}

function onSelectOption(move) {
  store.playMove(move)
  selectedCardId.value = null
}

function newGame() {
  selectedCardId.value = null
  store.startGame()
}

watch(
  () => store.currentPlayer,
  () => {
    selectedCardId.value = null
  },
)
</script>

<template>
  <main class="game-view">
    <Scoreboard
      :score="store.score"
      :current-player="store.currentPlayer"
      :winner="store.winner"
    />

    <div class="status">
      <template v-if="isGameOver">
        <span v-if="store.winner === 'human'">🎉 ¡Ganaste!{{ store.zapatero === 'ai' ? ' (¡zapatería!)' : '' }}</span>
        <span v-else>🤖 Ganó la máquina{{ store.zapatero === 'human' ? ' (¡zapatería!)' : '' }}</span>
      </template>
      <template v-else-if="isHumanTurn">Tu turno</template>
      <template v-else>Turno de la máquina…</template>

      <span
        v-if="store.lastMove && store.lastMove.points > 0 && !isGameOver"
        class="status__points"
      >
        {{ store.lastMove.player === 'human' ? 'Tú' : 'Máquina' }} +{{ store.lastMove.points }}
      </span>
    </div>

    <div class="ai-hand">
      <Card v-for="card in aiHand" :key="card.id" :card="card" :face-down="true" small />
    </div>

    <Table :cards="table" :highlight-ids="tableHighlightIds" />

    <CaptureOptions
      v-if="selectedCard && isHumanTurn"
      :card="selectedCard"
      :moves="selectedMoves"
      :table="table"
      :last-thrown-card="store.game?.lastThrownCard ?? null"
      :score="store.score.human"
      @select="onSelectOption"
    />

    <Hand
      :cards="humanHand"
      :selected-id="selectedCardId"
      :disabled="!isHumanTurn || isGameOver"
      @select="onCardClick"
    />

    <div class="game-actions">
      <button v-if="isGameOver" class="btn" @click="newGame">Jugar de nuevo</button>
      <RouterLink to="/" class="btn btn--ghost">Inicio</RouterLink>
    </div>
  </main>
</template>
