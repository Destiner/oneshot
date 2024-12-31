import type { Chat } from '@/stores/chats';
import { ref, type Ref } from 'vue';

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
export type { Chat };
