import type { ToolId } from '@/services/api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

type Message = UserMessage | AssistantMessage;
type Model = 'claude-3-5-sonnet-latest' | 'claude-3-5-haiku-latest';

interface TextContent {
  type: 'text';
  text: string;
}

interface ToolContent {
  type: 'tool';
  toolId: ToolId;
  commandId: string;
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
  inProgress: boolean;
  isError: boolean;
}

interface Chat {
  title: string | null;
  messages: Message[];
}

const useStore = defineStore('chats', () => {
  const chats = ref<Chat[]>([]);
  const selectedChatIndex = ref<number>(0);

  function setChats(newChats: Chat[]) {
    chats.value = newChats;
    setSelectedChatIndex(newChats.length - 1);
  }

  function setSelectedChatIndex(index: number) {
    selectedChatIndex.value = index;
  }

  return { chats, setChats, selectedChatIndex, setSelectedChatIndex };
});

export default useStore;
export type { Chat, Model, Message, TextContent, ToolContent };
