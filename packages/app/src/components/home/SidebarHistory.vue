<template>
  <div class="root">
    <div class="list">
      <div
        v-for="(chat, index) in orderedChats"
        :key="index"
        class="item"
        :class="{ selected: isSelected(index) }"
        @click="handleSelectChat(index)"
      >
        {{ chat.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Chat } from '@/stores/chats';

const { chats, selectedChatIndex } = defineProps<{
  chats: Chat[];
  selectedChatIndex: number;
}>();

const emit = defineEmits<{
  'select-chat': [index: number];
}>();

function handleSelectChat(index: number) {
  emit('select-chat', getReverseIndex(index));
}

// Reverse the order of the chats
const orderedChats = computed(() => {
  const chatCopy = [...chats];
  return chatCopy.reverse();
});

function isSelected(index: number) {
  return getReverseIndex(index) === selectedChatIndex;
}

function getReverseIndex(index: number) {
  return orderedChats.value.length - index - 1;
}
</script>

<style scoped>
.root {
  width: 250px;
  padding: 8px;
  border-right: 1px solid #000;
  background: #2d2f2f;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  padding: 8px;
  border-radius: 4px;
  cursor: default;

  &.selected {
    background: #5d5e5e;
  }
}
</style>
