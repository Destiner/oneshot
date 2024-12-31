<template>
  <div class="content">
    <TransitionGroup name="list">
      <div
        v-for="(part, index) in message.content"
        :key="index"
      >
        <div
          v-if="part.type === 'text'"
          class="text"
        >
          {{ part.text }}
        </div>
        <div
          class="tool-call"
          v-else-if="part.type === 'tool'"
        >
          <details>
            <summary>
              <ToolHeader
                :id="part.toolId"
                :command-id="part.commandId"
                :is-done="!!part.output"
              />
            </summary>
            <div class="tool-content">
              <div
                class="tool-input"
                v-if="part.input"
              >
                <div>→</div>
                <div>{{ part.input }}</div>
              </div>
              <div
                class="tool-output"
                v-if="part.output"
              >
                <div>←</div>
                <div>{{ part.output }}</div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: Message;
}>();
</script>

<script lang="ts">
import { type Message } from '@/composables/useChat';

import ToolHeader from './ToolHeader.vue';
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  max-width: 80ch;
  overflow: scroll;
  gap: 8px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  transform: translateY(8px);
  opacity: 0;
}

.text {
  white-space: pre-wrap;
  -webkit-user-select: initial;
  user-select: initial;
}

.tool-call {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #2d2f2f;

  summary {
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }
}

.tool-content {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-top: 1px solid #3d3f3f;
  font-family: 'SF Mono', monospace;
  gap: 8px;
}

.tool-input,
.tool-output {
  display: flex;
  gap: 8px;
}

.tool-output {
  max-height: 250px;
  overflow-y: auto;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
