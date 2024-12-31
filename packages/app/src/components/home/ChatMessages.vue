<template>
  <div
    class="messages"
    ref="rootEl"
    @scroll="handleScroll"
  >
    <div
      v-for="(group, index) in groupedMessages"
      :key="index"
      class="message-group"
    >
      <div class="group-icon">
        <IconPerson
          v-if="group[0]?.role === 'user'"
          class="icon"
        />
        <IconClaude
          v-else
          class="icon"
        />
      </div>
      <div class="group-messages">
        <ChatMessage
          v-for="(message, messageIndex) in group"
          :key="messageIndex"
          :message="message"
        />
      </div>
    </div>
    <div ref="bottomEl" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, useTemplateRef, ref, watch } from 'vue';

import IconClaude from '@/components/__common/IconClaude.vue';
import IconPerson from '@/components/__common/IconPerson.vue';
import type { Message, Model } from '@/composables/useChat';

import ChatMessage from './ChatMessage.vue';

const { messages } = defineProps<{
  messages: Message[];
}>();

const rootEl = useTemplateRef<HTMLDivElement>('rootEl');
const bottomEl = useTemplateRef<HTMLDivElement>('bottomEl');
const isAutoscrolling = ref(false);
const atBottom = ref(false);
function handleScroll() {
  function isAtBottom() {
    const container = rootEl.value;
    if (!container) {
      return false;
    }
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight ===
      0
    );
  }

  if (!isAutoscrolling.value) {
    atBottom.value = isAtBottom();
  }
  isAutoscrolling.value = false;
}
async function autoScroll() {
  if (!atBottom.value) {
    return;
  }
  if (!bottomEl.value) {
    return;
  }
  isAutoscrolling.value = true;
  // Wait until the message is rendered
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
.messages {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: scroll;
  gap: 24px;
}

.message-group {
  display: flex;
  gap: 16px;
}

.group-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;

  .icon {
    width: 24px;
    height: 24px;
  }
}

.group-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
}
</style>
