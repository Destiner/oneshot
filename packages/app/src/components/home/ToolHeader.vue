<template>
  <div
    class="header"
    v-if="tool"
  >
    <img
      class="icon"
      :src="tool.iconUrl"
    />
    {{ tool.actionDescription }}
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

const { id } = defineProps<{
  id: ToolId;
}>();

const tools = computed(() => {
  return toolsStore.tools;
});
const tool = computed(() => {
  return tools.value.find((tool) => tool.id === id);
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 12px;
  font-size: 16px;
  gap: 8px;
  cursor: default;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
