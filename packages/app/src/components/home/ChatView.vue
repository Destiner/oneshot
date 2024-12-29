<template>
  <div class="root">
    <ChatMessages :messages />
    <div class="composer">
      <form @submit.prevent="send">
        <input
          type="text"
          v-model="prompt"
          placeholder="Ask anything…"
        />
        <button
          class="button"
          type="submit"
        >
          <IconPaperplane
            class="icon"
            v-if="prompt.length > 0"
          />
        </button>
      </form>
      <div class="toolbar">
        <div class="side">
          <div class="button">
            <IconHammer class="icon" />
            Tools
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import IconHammer from '@/components/__common/IconHammer.vue';
import IconPaperplane from '@/components/__common/IconPaperplane.vue';
import ApiService from '@/services/api';
import useEnv from '@/composables/useEnv';

import ChatMessages, { type Message } from './ChatMessages.vue';

const { apiBaseUrl } = useEnv();

const api = new ApiService(apiBaseUrl);

const prompt = ref('');
const messages = ref<Message[]>([]);

async function send() {
  messages.value.push({
    role: 'user',
    content: [{ type: 'text', text: prompt.value }],
  });
  prompt.value = '';

  await api.streamLlmChatResponse('sonnet-3.5', messages.value, (event) => {
    if (event.type === 'message_start') {
      messages.value.push({
        role: event.message.role,
        content: event.message.content,
      });
    } else if (event.type === 'content_block_start') {
      const newContentBlock = event.content_block;
      if (newContentBlock.type === 'tool_use') {
        newContentBlock.input = '';
        // Set the new tool call to be visible by default
        const messageIndex = messages.value.length - 1;
        const blockIndex = messages.value[messageIndex].content.length;
        showToolCallDetails.value[`${messageIndex}-${blockIndex}`] = true;
      }
      messages.value[messages.value.length - 1].content.push(newContentBlock);
    } else if (event.type === 'content_block_delta') {
      const latestMessage = messages.value[messages.value.length - 1];
      const latestContentBlock =
        latestMessage.content[latestMessage.content.length - 1];
      if (latestContentBlock.type === 'text') {
        const delta =
          event.delta.type === 'text_delta'
            ? event.delta.text
            : event.delta.partial_json;
        latestContentBlock.text += delta;
      } else if (latestContentBlock.type === 'tool_use') {
        if (event.delta.type === 'input_json_delta') {
          latestContentBlock.input += event.delta.partial_json;
        }
      }
    }
  });
}
</script>

<style scoped>
.root {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: end;
  padding: 8px;
  background: #1e1e1e;
}

.composer {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: #272727;
}

.button {
  display: flex;
  align-items: center;
  padding: 8px;
  border: none;
  border-radius: 8px;
  outline: none;
  background: transparent;
  gap: 8px;
}

form {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-radius: 8px 8px 0 0;
  background: #494949;

  .button {
    &:hover {
      background: #626262;
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-radius: 0 0 8px 8px;
  cursor: default;

  .button {
    &:hover {
      background: #333;
    }
  }
}

input {
  width: 100%;
  padding: 8px;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-size: 16px;

  &::placeholder {
    color: #a4a4a4;
  }
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
