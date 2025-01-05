<template>
  <Select.Root
    :model-value="selected"
    @update:model-value="handleModelValueUpdate"
  >
    <Select.Trigger class="trigger">
      <div class="button">
        <template v-if="!selectedTool">
          <IconHammer class="icon" />
          Tools
        </template>
        <template v-else>
          <img
            :src="selectedTool.iconUrl"
            class="icon"
          />
          {{ selectedTool.name }}
        </template>
      </div>
    </Select.Trigger>

    <Select.Content
      :side-offset="5"
      :position="'popper'"
      :prioritize-position="true"
    >
      <div class="panel">
        <Select.Viewport class="viewport">
          <Select.Group>
            <Select.Item
              v-for="(tool, index) in availableTools"
              :key="index"
              class="item"
              :value="tool.id"
            >
              <img
                :src="tool.iconUrl"
                class="icon"
              />
              <Select.ItemText>
                {{ tool.name }}
              </Select.ItemText>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>
      </div>
    </Select.Content>
  </Select.Root>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Select } from 'radix-vue/namespaced';

import IconHammer from '@/components/__common/IconHammer.vue';
import useToolsStore from '@/stores/tools';
import type { Tool, ToolId } from '@/services/api';

const selected = defineModel<ToolId | undefined>({
  required: true,
});

defineProps<{
  tools: Tool[];
}>();

const toolsStore = useToolsStore();

function handleModelValueUpdate(value: string) {
  selected.value = value as ToolId;
}

const tools = computed(() => toolsStore.tools);
const availableTools = computed(() =>
  tools.value.filter((tool) => tool.enabled),
);
const selectedTool = computed(() =>
  selected.value
    ? availableTools.value.find((tool) => tool.id === selected.value)
    : null,
);
</script>

<style scoped>
/* reset */
button {
  all: unset;
}

.panel {
  overflow: hidden;
  border: 1px solid #333;
  border-radius: 6px;
  background: #494949;
}

.button {
  display: flex;
  align-items: center;
  padding: 8px;
  border: none;
  border-radius: 8px;
  outline: none;
  background: transparent;
  gap: 8px;

  &:hover {
    background: #333;
  }
}

.viewport {
  padding: 5px;
}

.item {
  display: flex;
  position: relative;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  color: white;
  user-select: none;
}

.item[data-highlighted] {
  outline: none;
  background: #626262;
  color: white;
}

.icon {
  width: 16px;
  height: 16px;
}

.icon-cross {
  width: 12px;
  height: 12px;
  cursor: pointer;
}
</style>
