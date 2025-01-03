<template>
  <div class="root">
    <div class="list">
      <RouterLink
        v-for="(chat, index) in chats"
        :key="index"
        class="item"
        :to="`/chat/${index}`"
      >
        <div>
          {{ chat.title ?? 'New Chat' }}
        </div>
      </RouterLink>
    </div>
    <div class="options">
      <RouterLink
        to="/tools"
        class="item"
      >
        Tools
      </RouterLink>
      <RouterLink
        to="/providers"
        class="item"
      >
        Providers
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '@/stores/chats';

const { chats } = defineProps<{
  chats: Chat[];
}>();
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 250px;
  padding: 8px;
  overflow-y: scroll;
  border-right: 1px solid #000;
  background: #2d2f2f;
  gap: 32px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  padding: 8px;
  border-radius: 4px;
  color: inherit;
  text-decoration: none;
  cursor: default;

  &.router-link-active {
    background: #5d5e5e;
  }
}

.options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option {
  border-radius: 4px;
  cursor: default;

  a {
    color: inherit;
    text-decoration: none;
  }
}
</style>
