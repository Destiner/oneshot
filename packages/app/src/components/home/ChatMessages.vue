<template>
  <div
    class="chat-messages"
    ref="rootEl"
  >
    <TransitionGroup name="list">
      <ChatMessageGroup
        v-for="(group, index) in groupedMessages"
        :key="index"
        :group
        :is-responding="isResponding && index === groupedMessages.length - 1"
      />
    </TransitionGroup>
    <div ref="bottomEl" />
  </div>
</template>

<script setup lang="ts">
import { useScroll, whenever } from '@vueuse/core';
import { computed, ref, useTemplateRef, watch, nextTick } from 'vue';

import type { Message, Model } from '@/stores/chats';

import ChatMessageGroup from './ChatMessageGroup.vue';

const { messages, isResponding } = defineProps<{
  messages: Message[];
  isResponding: boolean;
}>();

const rootEl = useTemplateRef<HTMLDivElement>('rootEl');
const bottomEl = useTemplateRef<HTMLDivElement>('bottomEl');

const { directions, arrivedState } = useScroll(rootEl);
const isAtBottom = computed(() => arrivedState.bottom);
whenever(isAtBottom, () => {
  isAutoscrolling.value = true;
});
whenever(
  () => directions.top,
  () => {
    if (isAtBottom.value) {
      return;
    }
    isAutoscrolling.value = false;
  },
);
whenever(
  () => isResponding,
  () => {
    isAutoscrolling.value = isAtBottom.value;
  },
);
const isAutoscrolling = ref(false);
async function autoScroll() {
  if (!isAutoscrolling.value) {
    return;
  }
  if (!bottomEl.value) {
    return;
  }
  await nextTick();
  bottomEl.value.scrollIntoView({ behavior: 'smooth' });
}
// On a new message or a message being updated, scroll to the bottom
watch(
  () => messages,
  () => {
    autoScroll();
  },
  {
    deep: true,
  },
);

// Group messages by role and model
// Keep the order of the messages
const groupedMessages = computed<Message[][]>(() => {
  let latestRole:
    | { role: 'user' }
    | { role: 'assistant'; model: Model }
    | null = null;
  const groups: Message[][] = [];
  let latestGroup: Message[] = [];

  for (const message of messages) {
    let sameGroup = true;
    // Update the latest group if the role changes
    if (!latestRole || latestRole.role !== message.role) {
      if (latestRole) {
        sameGroup = false;
      }
      if (message.role === 'user') {
        latestRole = { role: 'user' };
      } else {
        latestRole = { role: 'assistant', model: message.model };
      }
    }

    if (sameGroup) {
      latestGroup.push(message);
    } else {
      groups.push(latestGroup);
      latestGroup = [message];
    }
  }
  if (latestGroup.length > 0) {
    groups.push(latestGroup);
  }

  return groups;
});
</script>

<style scoped>
.chat-messages {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: scroll;
  gap: 24px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>
