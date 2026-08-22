import { defineStore } from 'pinia'
import {
  createGame,
  getLegalMoves,
  applyMove,
  chooseMove,
  capturePoints,
} from '../game/index.js'
import { saveGame, loadGame, clearGame } from '../services/storage.js'
import { playCard, playCapture, playWin, playLose } from '../services/audio.js'
import { useSettingsStore } from './settings.js'
import { useStatsStore } from './stats.js'

// Temporizador del turno de la IA (uno por partida activa).
let aiTimer = null

export const useGameStore = defineStore('game', {
  state: () => ({
    game: null,
    log: [],
    lastMove: null,
  }),

  getters: {
    isGameOver: (s) => s.game?.phase === 'gameOver',
    winner: (s) => s.game?.winner ?? null,
    currentPlayer: (s) => s.game?.currentPlayer ?? null,
    isHumanTurn: (s) => s.game?.phase === 'playing' && s.game.currentPlayer === 'human',
    isAiTurn: (s) => s.game?.phase === 'playing' && s.game.currentPlayer === 'ai',
    score: (s) => s.game?.score ?? { human: 0, ai: 0 },
    table: (s) => s.game?.table ?? [],
    humanHand: (s) => s.game?.hands.human ?? [],
    aiHand: (s) => s.game?.hands.ai ?? [],
    legalMoves: (s) => (s.game && s.game.phase === 'playing' ? getLegalMoves(s.game) : []),
  },

  actions: {
    _clearTimer() {
      if (aiTimer) {
        clearTimeout(aiTimer)
        aiTimer = null
      }
    },

    startGame() {
      this._clearTimer()
      this.game = createGame()
      this.log = []
      this.lastMove = null
      saveGame(this.game)
      this._maybeScheduleAi()
    },

    resumeGame() {
      const saved = loadGame()
      if (!saved) return false
      this._clearTimer()
      this.game = saved
      this.log = []
      this.lastMove = null
      this._maybeScheduleAi()
      return true
    },

    playMove(move) {
      if (!this.game || this.game.phase !== 'playing') return

      const player = this.game.currentPlayer
      const points = move.captured.length > 0 ? capturePoints(move.captured, this.game.table) : 0

      this.game = applyMove(this.game, move)
      this.log.push({ player, move, points })
      this.lastMove = { player, move, points }

      if (this.game.phase === 'gameOver') {
        clearGame()
        useStatsStore().recordGame({
          result: this.game.winner === 'human' ? 'win' : 'loss',
          humanScore: this.game.score.human,
          aiScore: this.game.score.ai,
        })
        if (this.game.winner === 'human') playWin()
        else playLose()
      } else {
        saveGame(this.game)
        if (points > 0) playCapture(points)
        else playCard()
      }

      this._maybeScheduleAi()
    },

    _maybeScheduleAi() {
      this._clearTimer()
      if (this.isAiTurn) {
        const delay = useSettingsStore().aiDelay
        aiTimer = setTimeout(() => this._playAiMove(), delay)
      }
    },

    _playAiMove() {
      if (!this.isAiTurn) return
      const move = chooseMove(this.game)
      if (move) this.playMove(move)
    },
  },
})
