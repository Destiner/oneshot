<template>
  <div
    class="group"
    v-if="latestMessage"
  >
    <div class="group-icon">
      <IconPerson
        v-if="latestMessage.role === 'user'"
        class="icon"
      />
      <IconClaude
        v-else
        class="icon"
        :class="{ 'in-progress': latestMessage.inProgress }"
      />
    </div>
    <div class="content">
      <div
        class="name"
        v-if="roleName"
      >
        {{ roleName }}
      </div>
      <div class="messages">
        <ChatMessage
          v-for="(message, messageIndex) in group"
          :key="messageIndex"
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
import type { Message } from '@/stores/chats';
import ChatMessage from './ChatMessage.vue';

const { group } = defineProps<{
  group: Message[];
}>();

const latestMessage = computed(() => {
  return group[group.length - 1];
});

const roleName = computed(() => {
  if (!latestMessage.value) {
    return null;
  }
  if (latestMessage.value.role === 'user') {
    return 'You';
  }
  switch (latestMessage.value.model) {
    case 'sonnet-3.5':
      return 'Claude Sonnet 3.5';
  }
});
</script>

<style scoped>
.group {
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
}

.group-icon .icon {
  width: 24px;
  height: 24px;
}

.icon.in-progress {
  transition: opacity 0.5s ease-in-out;
  opacity: 0.5;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.name {
  font-weight: 500;
}

.messages {
  gap: 16px;
  display: flex;
  flex-direction: column;
}
</style>
