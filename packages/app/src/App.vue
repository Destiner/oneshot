<template>
  <div class="app">
    <Header
      :title="title"
      :with-sidebar="withSidebar"
      @toggle-sidebar="handleToggleSidebar"
      @new-chat="handleNewChat"
    />
    <div class="main">
      <SidebarHistory
        v-if="withSidebar"
        :chats="chats"
        :selected-chat-index="selectedChatIndex"
        @select-chat="handleSelectChat"
      />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Header from '@/components/_app/Header.vue';
import SidebarHistory from '@/components/_app/SidebarHistory.vue';
import useStore from '@/composables/useStore';
import useChatsStore, { type Chat } from '@/stores/chats';

const store = useStore();
const chatsStore = useChatsStore();
const withSidebar = ref(false);
const title = ref('Home');

const chats = computed(() => chatsStore.chats);
const selectedChatIndex = computed(() => chatsStore.selectedChatIndex);

onMounted(async () => {
  const chats = await store.get<Chat[]>('chats');
  if (chats) {
    chatsStore.setChats(chats);
  }
});

function handleToggleSidebar() {
  withSidebar.value = !withSidebar.value;
}

function handleNewChat() {
  chatsStore.chats.push({
    title: null,
    messages: [],
  });
}

function handleSelectChat(index: number) {
  chatsStore.setSelectedChatIndex(index);
}
</script>

<style>
:root {
  overflow: hidden;
  background: #2f2f2f;
  color: #f6f6f6;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 14px;
  -webkit-user-select: none;
  user-select: none;
}

body {
  margin: 0;
}

#app,
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
