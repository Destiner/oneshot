<template>
  <Select.Root
    :model-value="selected"
    @update:model-value="handleModelValueUpdate"
  >
    <Select.Trigger class="trigger">
      <slot name="trigger" />
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
              v-for="(tool, index) in tools"
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
import { Select } from 'radix-vue/namespaced';

import type { Tool, ToolId } from '@/services/api';

const selected = defineModel<ToolId | undefined>({
  required: true,
});

defineProps<{
  tools: Tool[];
}>();

function handleModelValueUpdate(value: string) {
  selected.value = value as ToolId;
}
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
</style>
