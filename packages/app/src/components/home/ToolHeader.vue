<template>
  <div
    class="header"
    v-if="tool"
  >
    <img
      class="icon"
      :src="tool.iconUrl"
    />
    {{ actionDescription }}
  </div>
  <div
    class="header"
    v-else
  >
    {{ id }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ToolId } from '@/services/api';
import useToolsStore from '@/stores/tools';

const toolsStore = useToolsStore();

const { id, commandId, isDone } = defineProps<{
  id: ToolId;
  commandId: string;
  isDone: boolean;
}>();

const tools = computed(() => {
  return toolsStore.tools;
});
const tool = computed(() => {
  return tools.value.find((tool) => tool.id === id);
});

const actionDescription = computed<string | null>(() => {
  if (!tool.value) {
    return null;
  }
  const command = tool.value.commands[commandId];
  if (!command) {
    return null;
  }
  return isDone
    ? command.actionDescription.done
    : command.actionDescription.progress;
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 8px;
  cursor: default;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
