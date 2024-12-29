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
        <div class="tool-header">
          <div class="tool-icon" />
          {{ part.tool.action }}
        </div>
        <div class="tool-content">
          <div class="tool-input">
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
type Message = UserMessage | AssistantMessage;
type Model = 'sonnet-3.5';
type ToolIcon = 'exa' | 'linear' | 'e2b' | 'files' | 'sequence';

interface Tool {
  icon: ToolIcon;
  action: string;
}

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolContent {
  type: 'tool';
  tool: Tool;
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

export type { Model, Message };
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text {
  -webkit-user-select: initial;
  user-select: initial;
}

.tool-call {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background: #2d2f2f;
}

.tool-header {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #3d3f3f;
  font-size: 16px;
  gap: 8px;
}

.tool-icon {
  width: 20px;
  height: 20px;
  background: #8f8f8f;
}

.tool-content {
  display: flex;
  flex-direction: column;
  padding: 8px;
  font-family: 'SF Mono', monospace;
  gap: 8px;
}

.tool-input,
.tool-output {
  display: flex;
  gap: 8px;
}
</style>
