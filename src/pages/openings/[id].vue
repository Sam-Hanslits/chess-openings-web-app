<template>
  <v-container>
    <!-- Header and Opening Info -->
    <v-row justify="center">
      <v-col v-if="openingData" cols="12" class="text-center">
        <h1 class="text-h3 mb-2">{{ openingData.name }}</h1>
        <h2 v-if="currentLine" class="text-h5 font-weight-light mb-4">{{ currentLine.name }}</h2>
        <v-sheet max-width="800" class="mx-auto bg-transparent">
          <p class="text-body-1 text-medium-emphasis text-justify">{{ openingData.description }}</p>
        </v-sheet>
      </v-col>
      <v-col v-else>
        <p class="text-center">Loading opening...</p>
      </v-col>

      <!-- Chessboard -->
      <v-col cols="12" class="d-flex justify-center my-4">
        <div ref="boardEl" style="width: 400px; max-width: 100%;"></div>
      </v-col>

      <!-- Expected Move Display -->
      <v-col v-if="expectedMove" cols="12" class="text-center">
        <p class="text-h6 font-weight-regular">
          Your move: <strong class="text-primary">{{ expectedMove }}</strong>
        </p>
      </v-col>
      <v-col v-else cols="12" class="text-center">
        <p class="text-h6 font-weight-regular">
          <strong class="text-primary">You've Reached The End of This Line</strong>
        </p>
      </v-col>

      <!-- Move Feedback -->
      <v-col v-if="moveFeedback" cols="12" class="text-center">
        <v-alert type="error" variant="tonal" density="compact" max-width="400px" class="mx-auto">
          {{ moveFeedback }}
        </v-alert>
      </v-col>

      <template v-if="openingData">
        <!-- Line Navigation -->
        <v-col cols="auto">
          <v-btn 
            @click="openingStore.currentLineIndex = Math.max(openingStore.currentLineIndex - 1, 0)">
            Previous Line
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            @click="openingStore.currentLineIndex = Math.min(openingStore.currentLineIndex + 1, openingData.lines.length - 1)">
            Next Line
          </v-btn>
        </v-col>
        <v-col cols="12" class="d-flex justify-center mt-2">
            <v-btn @click="resetLine" color="secondary">
              Reset Line
            </v-btn>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useOpeningStore } from '@/stores/openingStore.ts';
import { useUserStore } from '@/stores/userStore.ts';
import '@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css';
import { Chess } from 'chess.js';
import $ from 'jquery';

declare global {
  interface Window { Chessboard: any; $: any; }
}

const props = defineProps<{
  id: string;
}>();

const openingStore = useOpeningStore();
const userStore = useUserStore();
const { currentLineIndex } = storeToRefs(openingStore);
const openingData = computed(() => openingStore.getOpening(props.id));
const currentLine = computed(() => {
  if (!openingData.value || openingData.value.lines.length === 0) return null;
  return openingData.value.lines[currentLineIndex.value];
});

// --- Board and Game State ---
const boardEl = ref<HTMLElement | null>(null)
const board = ref<any>(null);
const whiteMoves = computed(() => currentLine.value ? currentLine.value.moves.filter((_, i) => i % 2 === 0) : []);
const blackMoves = computed(() => currentLine.value ? currentLine.value.moves.filter((_, i) => i % 2 === 1) : []);
const playerMoves = computed(() => {
  if (!openingData.value) return [];
  return openingData.value.color === 'white' ? whiteMoves.value : blackMoves.value;
});
const opponentMoves = computed(() => {
  if (!openingData.value) return [];
  return openingData.value.color === 'white' ? blackMoves.value : whiteMoves.value;
});
const game = ref(new Chess());
const moveIndex = ref(0); // Tracks the current move number in the sequence
const moveFeedback = ref<string | null>(null);
const expectedMove = computed(() => {
  if (!playerMoves.value || moveIndex.value >= playerMoves.value.length) {
    userStore.markLineCompleted(currentLine.value?.id || "");
    return null;
  }
  return playerMoves.value[moveIndex.value];
});

// --- Watchers to keep state in sync ---
watch(() => props.id, (newId) => {
  openingStore.selectedOpeningId = newId;
  openingStore.currentLineIndex = 0;
  resetLine();
}, { immediate: true });

watch(openingData, (newOpening) => {
  if (board.value && newOpening) {
    board.value.orientation(newOpening.color);
    resetLine();
  }
});

watch(currentLine, () => {
  resetLine();
});

function makeOpponentMove() {
  if (moveIndex.value < opponentMoves.value.length) {
    const opponentMove = opponentMoves.value[moveIndex.value];
    
    if (opponentMove) {
      setTimeout(() => {
      game.value.move(opponentMove);
      board.value.position(game.value.fen());
      }, 300);
    }
  }
}

function resetLine() {
  game.value.reset();
  if (board.value) {
    board.value.position(game.value.fen());
  }
  moveIndex.value = 0;
  moveFeedback.value = null;

  if (openingData.value?.color === 'black') {
    makeOpponentMove();
  }
}

const onDrop = (source: string, target: string) => {
  moveFeedback.value = null; // Clear previous feedback

  // Create a move object for chess.js
  const move = {
    from: source,
    to: target,
    promotion: 'q'
  };

  const tempGame = new Chess(game.value.fen());
  let moveResult = null;
  try {
    moveResult = tempGame.move(move);
  } catch (e) {
    moveResult = null;
  }

  if (moveResult === null) {
    moveFeedback.value = 'Illegal move.';
    return 'snapback';
  }

  if (moveResult.san === expectedMove.value) {
    game.value.move(move); // Advance the main game state

    if(openingData.value?.color === 'white') {
      makeOpponentMove();
      moveIndex.value++;
    } else {
      moveIndex.value++;
      makeOpponentMove();
    }
  } else {
    // Incorrect move
    moveFeedback.value = `Incorrect. The expected move was ${expectedMove.value}.`;
    return 'snapback';
  }
};

onMounted(() => {
  const initializeBoard = async () => {
    if (boardEl.value) {
      window.$ = $;

      // Dynamically import dependencies in the correct order
      await import('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js');

      board.value = new window.Chessboard(boardEl.value, {
        position: 'start',
        pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
        orientation: openingData.value?.color || 'white',
        draggable: true,
        moveOffBoard: true,
        dropOffBoard: 'snapback',
        onDrop: onDrop,
        // This prevents pieces from moving if it's not their turn
        onDragStart: (source: string, piece: string) => {
          if (game.value.isGameOver() || 
              (game.value.turn() === 'w' && piece.search(/^b/) !== -1) ||
              (game.value.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false;
          }
          // Also check if we are at the end of the line for the player
          if (moveIndex.value >= playerMoves.value.length) return false;
          return true;
        }
      });
    }
  };

  initializeBoard();
});


</script>