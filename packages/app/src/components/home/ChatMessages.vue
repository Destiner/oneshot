<template>
  <div class="messages">
    <div
      v-for="group in groupedMessages"
      :key="group.id"
      class="message-group"
    >
      <div class="group-icon">
        <IconPerson
          v-if="group[0].role === 'user'"
          class="icon"
        />
        <IconClaude
          v-else
          class="icon"
        />
      </div>
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

import IconClaude from '@/components/__common/IconClaude.vue';
import IconPerson from '@/components/__common/IconPerson.vue';

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
  if (latestGroup.length > 0) {
    groups.push(latestGroup);
  }

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
  gap: 8px;
  padding-top: 4px;
}
</style>
