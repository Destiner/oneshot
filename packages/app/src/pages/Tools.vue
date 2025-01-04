<template>
  <div class="content">
    <div class="tools">
      <ToolForm
        v-for="(tool, index) in tools"
        :key="tool.id"
        v-model="toolsStore.tools[index]"
        @update:model-value="handleToolUpdate()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { computed, onMounted } from 'vue';

import ToolForm from '@/components/tools/ToolForm.vue';
import useEnv from '@/composables/useEnv';
import useStore from '@/composables/useStore';
import useToolsStore from '@/stores/tools';
import useUiStore from '@/stores/ui';
import ApiService from '@/services/api';

const { apiBaseUrl } = useEnv();
const toolsStore = useToolsStore();
const store = useStore();
const uiStore = useUiStore();

const api = new ApiService(apiBaseUrl);

const tools = computed(() => toolsStore.tools);

onMounted(() => {
  uiStore.setTitle('Tools');
});

async function handleToolUpdate() {
  requestUpdate();
}

const requestUpdate = useDebounceFn(() => {
  // Update API based on what changed
  api.setTools(tools.value);
  // Save to local storage
  store.set('tools', tools.value);
}, 3000);
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
  margin: 16px;
  overflow-y: auto;
}

.tools {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
</style>
