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
          <SelectTool
            :tools
            v-model="selectedToolId"
          >
            <template #trigger>
              <div class="button">
                <template v-if="!selectedTool">
                  <IconHammer class="icon" />
                  Tools
                </template>
                <template v-else>
                  <img
                    :src="selectedTool.iconUrl"
                    class="icon"
                  />
                  {{ selectedTool.name }}
                </template>
              </div>
            </template>
          </SelectTool>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Anthropic from '@anthropic-ai/sdk';
import { computed, ref, onMounted } from 'vue';

import IconHammer from '@/components/__common/IconHammer.vue';
import IconPaperplane from '@/components/__common/IconPaperplane.vue';
import ApiService, { type Tool, type ToolId } from '@/services/api';
import useEnv from '@/composables/useEnv';
import useToolsStore from '@/stores/tools';

import ChatMessages, { type Message } from './ChatMessages.vue';
import SelectTool from './SelectTool.vue';
import type { TextContent, ToolContent } from './ChatMessage.vue';

const { apiBaseUrl } = useEnv();
const toolsStore = useToolsStore();

const api = new ApiService(apiBaseUrl);

const prompt = ref('');
const messages = ref<Message[]>([]);
const selectedToolId = ref<ToolId | undefined>(undefined);
const selectedTool = computed(() =>
  selectedToolId.value
    ? toolsStore.tools.find((tool) => tool.id === selectedToolId.value)
    : null,
);
const tools = computed(() => toolsStore.tools);

onMounted(async () => {
  const newTools = await api.getTools();
  toolsStore.setTools(newTools);
});

function convertMessages(messages: Message[]): Anthropic.MessageParam[] {
  function generateToolUseId() {
    const number = Math.floor(Math.random() * 1000000);
    return `tool_id_${number}`;
  }

  const anthropicMessages: Anthropic.MessageParam[] = [];

  for (const message of messages) {
    for (const content of message.content) {
      if (content.type === 'text') {
        anthropicMessages.push({
          role: message.role,
          content: content.text,
        });
      } else if (content.type === 'tool') {
        const toolUseId = generateToolUseId();
        // Split tool content into tool_use (assistant) and tool_result (user) messages
        anthropicMessages.push({
          role: 'assistant',
          content: [
            {
              type: 'tool_use',
              id: toolUseId,
              name: content.tool,
              input: content.input ? JSON.parse(content.input) : {},
            },
          ],
        });

        if (content.output) {
          anthropicMessages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseId,
                content: content.output,
              },
            ],
          });
        }
      }
    }
  }

  return anthropicMessages;
}

async function send() {
  messages.value.push({
    role: 'user',
    content: [{ type: 'text', text: prompt.value }],
  });
  prompt.value = '';

  const tools = selectedTool.value ? [selectedTool.value.id] : [];

  const model = 'sonnet-3.5';

  await api.streamLlmChatResponse(
    model,
    convertMessages(messages.value),
    tools,
    // Convert Anthropic event to internal message structure
    (event) => {
      if (event.type === 'message_start') {
        messages.value.push({
          role: event.message.role,
          model,
          content: event.message.content as TextContent[],
        });
      } else if (event.type === 'content_block_start') {
        const newContentBlock = event.content_block;
        const contentBlock =
          newContentBlock.type === 'tool_use'
            ? ({
                type: 'tool',
                tool: getToolId(newContentBlock.name),
                input: '',
              } as ToolContent)
            : newContentBlock;
        const latestMessage = messages.value[messages.value.length - 1];
        if (!latestMessage) return;
        latestMessage.content.push(contentBlock);
      } else if (event.type === 'content_block_delta') {
        const latestMessage = messages.value[messages.value.length - 1];
        if (!latestMessage) return;
        const latestContentBlock =
          latestMessage.content[latestMessage.content.length - 1];
        if (!latestContentBlock) return;
        if (latestContentBlock.type === 'text') {
          const delta =
            event.delta.type === 'text_delta'
              ? event.delta.text
              : event.delta.partial_json;
          latestContentBlock.text += delta;
        } else if (latestContentBlock.type === 'tool') {
          if (event.delta.type === 'input_json_delta') {
            latestContentBlock.input += event.delta.partial_json;
          }
        }
      } else if (event.type === 'tool_result') {
        const latestMessage = messages.value[messages.value.length - 1];
        if (!latestMessage) return;
        const latestContentBlock =
          latestMessage.content[latestMessage.content.length - 1];
        if (!latestContentBlock) return;
        if (latestContentBlock.type === 'tool') {
          latestContentBlock.output = event.result;
        }
      }
    },
  );
}

function getToolId(name: string) {
  const toolId = name.split('_')[0];
  return toolId as ToolId;
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
