<template>
  <div class="messages">
    <div
      v-for="group in groupedMessages"
      :key="group.id"
      class="message-group"
    >
      <div class="group-icon" />
      <div class="group-messages">
        <ChatMessage
          v-for="message in group"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ChatMessage from './ChatMessage.vue';

const { messages } = defineProps<{
  messages: Message[];
}>();

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
  groups.push(latestGroup);

  return groups;
});
</script>

<script lang="ts">
import { type Message } from './ChatMessage.vue';

export type { Message };
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: scroll;
  gap: 8px;
}

.message-group {
  display: flex;
  gap: 16px;
}

.group-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #8f8f8f;
}

.group-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}
</style>
