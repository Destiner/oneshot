<template>
  <Header
    :title
    :with-sidebar
    @toggle-sidebar="handleToggleSidebar"
    @new-chat="handleNewChat"
  />
  <div class="content">
    <SidebarHistory
      v-if="withSidebar"
      :chats="chats"
      @select-chat="handleSelectChat"
      :selected-chat-index="selectedChatIndex"
    />
    <ChatView
      v-if="selectedChat"
      :chat="selectedChat"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import Header from '@/components/home/Header.vue';
import SidebarHistory from '@/components/home/SidebarHistory.vue';
import ChatView from '@/components/home/ChatView.vue';
import useChatsStore, { type Chat } from '@/stores/chats';

const chatsStore = useChatsStore();

const chats = computed(() => chatsStore.chats);

const withSidebar = ref(false);
const title = ref('Home');
const selectedChatIndex = ref(0);
const selectedChat = computed<Chat | undefined>(
  () => chats.value[selectedChatIndex.value],
);

function handleToggleSidebar() {
  withSidebar.value = !withSidebar.value;
}

function handleNewChat() {
  chats.value.push({
    title: null,
    messages: [],
  });
  selectedChatIndex.value = chats.value.length - 1;
}

function handleSelectChat(index: number) {
  selectedChatIndex.value = index;
}
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
