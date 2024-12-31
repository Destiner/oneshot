import type { ToolId } from '@/services/api';
import { ref, type Ref } from 'vue';

type Message = UserMessage | AssistantMessage;
type Model = 'sonnet-3.5';

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
}

interface Chat {
  title: string;
  messages: Message[];
}

interface UseChat {
  chats: Ref<Chat[]>;
}

function useChat(): UseChat {
  const chats = ref<Chat[]>([]);

  return {
    chats,
  };
}

export default useChat;
export type { Model, Message, TextContent, ToolContent };
