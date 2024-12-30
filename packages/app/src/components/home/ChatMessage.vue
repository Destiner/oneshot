<template>
  <div class="content">
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
            <ToolHeader :id="part.tool" />
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
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: Message;
}>();
</script>

<script lang="ts">
import { type ToolId } from '@/services/api';

import ToolHeader from './ToolHeader.vue';

type Message = UserMessage | AssistantMessage;
type Model = 'sonnet-3.5';

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolContent {
  type: 'tool';
  tool: ToolId;
  input: string;
  output?: string;
}

type MessageContent = TextContent | ToolContent;

interface UserMessage {
  role: 'user';
  content: MessageContent[];
}

interface AssistantMessage {
  role: 'assistant';
  model: Model;
  content: MessageContent[];
}

export type { Model, Message, TextContent, ToolContent };
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  max-width: 80ch;
  gap: 8px;
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
