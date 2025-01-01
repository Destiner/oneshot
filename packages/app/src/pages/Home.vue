<template>
  <div class="content">
    <ChatView
      v-if="selectedChat"
      :chat="selectedChat"
      @new-message="handleNewMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ChatView from '@/components/home/ChatView.vue';
import useChatsStore from '@/stores/chats';
import useStore from '@/composables/useStore';

const store = useStore();
const chatsStore = useChatsStore();

const selectedChatIndex = computed(() => chatsStore.selectedChatIndex);
const selectedChat = computed(() => chatsStore.chats[selectedChatIndex.value]);
function handleNewMessage() {
  store.set('chats', chatsStore.chats);
}
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
