<template>
  <div class="root">
    <ChatMessages
      :messages="chat.messages"
      :is-responding="isResponding"
      ref="messagesEl"
    />
    <div class="composer">
      <form @submit.prevent="send">
        <AutoResizeTextarea
          ref="el"
          v-model="prompt"
          placeholder="Ask anything…"
          @keydown.enter.exact.prevent="send"
          @keydown.alt.enter.prevent="prompt += '\n'"
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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Anthropic from '@anthropic-ai/sdk';
import { computed, ref, onMounted, useTemplateRef } from 'vue';

import IconPaperplane from '@/components/__common/IconPaperplane.vue';
import AutoResizeTextarea from '@/components/__common/AutoResizeTextarea.vue';
import ApiService, { type ToolId } from '@/services/api';
import type { Chat, Message, TextContent, ToolContent } from '@/stores/chats';
import useEnv from '@/composables/useEnv';
import useToolsStore from '@/stores/tools';

import ChatMessages from './ChatMessages.vue';
import SelectTool from './SelectTool.vue';

const { chat } = defineProps<{
  chat: Chat;
}>();

const emit = defineEmits<{
  'new-message': [];
}>();

const { apiBaseUrl } = useEnv();
const toolsStore = useToolsStore();
const api = new ApiService(apiBaseUrl);

const prompt = ref('');
const selectedToolId = ref<ToolId | undefined>(undefined);
const selectedTool = computed(() =>
  selectedToolId.value
    ? tools.value.find((tool) => tool.id === selectedToolId.value)
    : null,
);
const tools = computed(() => toolsStore.tools);

const textareaRef =
  useTemplateRef<InstanceType<typeof AutoResizeTextarea>>('el');

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
  setTool();
});

function setTool() {
  // Select the latest used tool (if any)
  const reversedMessages = [...chat.messages].reverse();
  for (const message of reversedMessages) {
    if (message.content.length > 0) {
      const reversedContent = [...message.content].reverse();
      for (const content of reversedContent) {
        if (content.type === 'tool') {
          selectedToolId.value = content.toolId;
          return;
        }
      }
    }
  }
}

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
              name: content.toolId,
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
  const promptValue = prompt.value;
  prompt.value = '';
  chat.messages.push({
    role: 'user',
    content: [{ type: 'text', text: promptValue }],
  });
  requestTitle(promptValue);
  const tools = selectedTool.value ? [selectedTool.value.id] : [];
  await request(tools);
  emit('new-message');
}

async function requestTitle(prompt: string) {
  // Only request once
  if (chat.title) {
    return;
  }
  const response = await api.getTitle(prompt);
  chat.title = response.title;
}

const isResponding = ref(false);
async function request(tools: ToolId[]) {
  const model = 'claude-3-5-sonnet-latest';
  isResponding.value = true;
  await api.streamLlmChatResponse(
    model,
    convertMessages(chat.messages),
    tools,
    // Convert Anthropic event to internal message structure
    (event) => {
      if (event.type === 'message_start') {
        chat.messages.push({
          role: event.message.role,
          model,
          content: event.message.content as TextContent[],
          isError: false,
        });
      } else if (event.type === 'content_block_start') {
        const newContentBlock = event.content_block;
        const contentBlock =
          newContentBlock.type === 'tool_use'
            ? ({
                type: 'tool',
                toolId: getToolId(newContentBlock.name),
                toolUseId: newContentBlock.id,
                commandId: getCommandId(newContentBlock.name),
                input: '',
              } as ToolContent)
            : newContentBlock;
        const latestMessage = chat.messages[chat.messages.length - 1];
        if (!latestMessage) return;
        latestMessage.content.push(contentBlock);
      } else if (event.type === 'content_block_delta') {
        const latestMessage = chat.messages[chat.messages.length - 1];
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
        // Find content block by tool_use_id
        const toolUseId = event.toolUseId;
        const toolUseContentBlock = chat.messages
          .map((message) => message.content)
          .flat()
          .find(
            (content) =>
              content.type === 'tool' && content.toolUseId === toolUseId,
          );
        if (!toolUseContentBlock) {
          return;
        }
        if (toolUseContentBlock.type !== 'tool') {
          return;
        }
        toolUseContentBlock.output = event.result;
      } else if (event.type === 'error') {
        chat.messages.push({
          role: 'assistant',
          model,
          content: [{ type: 'text', text: event.error.message }],
          isError: true,
        });
      }
    },
  );
  isResponding.value = false;
}

function getToolId(name: string) {
  const toolId = name.split('_')[0];
  return toolId as ToolId;
}

function getCommandId(name: string) {
  const toolId = getToolId(name);
  return name.substring(toolId.length + 1);
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

.icon {
  width: 16px;
  height: 16px;
}
</style>
