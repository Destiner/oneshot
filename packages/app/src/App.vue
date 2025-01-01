<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import useStore from '@/composables/useStore';
import useChatsStore, { type Chat } from '@/stores/chats';

const store = useStore();
const chatsStore = useChatsStore();

onMounted(async () => {
  const chats = await store.get<Chat[]>('chats');
  if (chats) {
    chatsStore.setChats(chats);
  }
});
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

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
