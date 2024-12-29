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

import ChatMessages, { type Message } from './ChatMessages.vue';

const prompt = ref('');
const messages = ref<Message[]>([
  {
    role: 'user',
    content: [
      { type: 'text', content: 'Could you please look up snow leopard facts?' },
    ],
  },
  {
    role: 'assistant',
    model: 'sonnet-3.5',
    content: [
      {
        type: 'text',
        content: 'Let me look up the facts for you.',
      },
    ],
  },
  {
    role: 'assistant',
    model: 'sonnet-3.5',
    content: [
      {
        type: 'tool',
        tool: {
          icon: 'exa',
          action: 'Searching with Exa',
        },
        input: 'snow leopard facts',
        output:
          '{"results": [{"title": "Snow Leopard Facts", "url": "https://www.snowleopardfacts.com"}, {"title": "Snow Leopard", "url": "https://wikipedia.org/wiki/Snow_leopard"}]}',
      },
      {
        type: 'tool',
        tool: {
          icon: 'exa',
          action: 'Searching with Exa',
        },
        input: 'snow leopard geography',
        output:
          '{"results": [{"title": "Snow Leopard Geography", "url": "https://www.snowleopardgeography.com"}, {"title": "Snow Leopard", "url": "https://wikipedia.org/wiki/Snow_leopard"}]}',
      },
    ],
  },
  {
    role: 'assistant',
    model: 'sonnet-3.5',
    content: [
      {
        type: 'text',
        content:
          'Based on the results, here are some facts about snow leopards: Snow leopards are a species of cat that are found in the mountains of Central and South Asia. They are known for their distinctive spotted coat and are considered a symbol of strength and beauty.',
      },
    ],
  },
]);

function send() {
  messages.value.push({
    role: 'user',
    content: [{ type: 'text', content: prompt.value }],
  });
  prompt.value = '';
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
