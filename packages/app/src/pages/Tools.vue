<template>
  <div class="content">
    <div class="tools">
      <div
        v-for="tool in tools"
        :key="tool.id"
        class="tool"
        :class="{ enabled: tool.enabled }"
      >
        <div class="header">
          <div class="header-side">
            <img
              :src="tool.iconUrl"
              alt="Tool Icon"
              class="icon"
            />
            {{ tool.name }}
          </div>
          <OneSwitch
            :model-value="tool.enabled"
            @update:model-value="toggleTool(tool.id)"
          />
        </div>
        <div class="commands">
          <h2>Commands</h2>
          <div
            v-for="(_, commandId) in tool.commands"
            :key="commandId"
            class="command"
          >
            {{ commandId }}
          </div>
        </div>
        <div
          class="params"
          v-if="
            (tool.args && tool.args.length > 0) ||
            Object.keys(tool.env).length > 0
          "
        >
          <h2>Params</h2>
          <div
            class="args"
            v-if="tool.args"
          >
            <div
              class="arg"
              v-for="(arg, index) in tool.args"
              :key="arg"
            >
              <input
                :id="arg"
                :value="arg"
                :placeholder="arg"
                @input="handleArgInput(tool.id, index, $event)"
              />
              <button @click="handleRemoveArgClick(tool.id, index)">
                <IconMinus class="icon" />
              </button>
            </div>
            <div>
              <button @click="handleAddArgClick(tool.id)">
                <IconPlus class="icon" />
              </button>
            </div>
          </div>
          <div class="env">
            <form
              v-for="(envValue, envKey) in tool.env"
              :key="envKey"
            >
              <label :for="envKey">{{ envKey }}</label>
              <input
                :id="envKey"
                :value="envValue"
                placeholder="Value"
                type="password"
                @input="handleEnvInput(tool.id, envKey, $event)"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import OneSwitch from '@/components/__common/OneSwitch.vue';
import IconMinus from '@/components/__common/IconMinus.vue';
import IconPlus from '@/components/__common/IconPlus.vue';
import useEnv from '@/composables/useEnv';
import useStore from '@/composables/useStore';
import useToolsStore from '@/stores/tools';
import ApiService, { type ToolId } from '@/services/api';

const { apiBaseUrl } = useEnv();
const toolsStore = useToolsStore();
const store = useStore();

const api = new ApiService(apiBaseUrl);

const tools = computed(() => toolsStore.tools);

async function toggleTool(id: ToolId) {
  const tool = tools.value.find((tool) => tool.id === id);
  if (!tool) {
    return;
  }
  if (tool.enabled) {
    tool.enabled = false;
    await api.disableTool(id);
  } else {
    tool.enabled = true;
    await api.enableTool(id);
  }
  save();
}

async function handleAddArgClick(id: ToolId) {
  const tool = tools.value.find((tool) => tool.id === id);
  if (!tool) {
    return;
  }
  if (!tool.args) {
    return;
  }
  tool.args.push('');
  await api.setToolArgs(id, tool.args);
  save();
}

async function handleRemoveArgClick(id: ToolId, index: number) {
  const tool = tools.value.find((tool) => tool.id === id);
  if (!tool) {
    return;
  }
  if (!tool.args) {
    return;
  }
  tool.args.splice(index, 1);
  await api.setToolArgs(id, tool.args);
  save();
}

async function handleArgInput(id: ToolId, index: number, event: Event) {
  const argValue = (event.target as HTMLInputElement).value;
  const tool = tools.value.find((tool) => tool.id === id);
  if (!tool) {
    return;
  }
  if (!tool.args) {
    return;
  }
  tool.args[index] = argValue;
  await api.setToolArgs(id, tool.args);
  save();
}

async function handleEnvInput(id: ToolId, envKey: string, event: Event) {
  const envValue = (event.target as HTMLInputElement).value;
  const tool = tools.value.find((tool) => tool.id === id);
  if (!tool) {
    return;
  }
  if (!tool.env) {
    return;
  }
  tool.env[envKey] = envValue;
  await api.setToolEnv(id, tool.env);
  save();
}

async function save() {
  store.set('tools', tools.value);
}
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

.tool {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  border: 1px solid #5d5e5e;
  border-radius: 8px;

  &.enabled {
    border-color: white;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-side {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 24px;
  height: 24px;
}

.args,
.env {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.arg {
  display: flex;
  align-items: center;
  gap: 4px;
}

h2 {
  margin: 0;
  font-size: 14px;
}

label {
  font-size: 12px;
}

input {
  width: 100%;
  padding: 4px;
  border: 1px solid #5d5e5e;
  border-radius: 4px;
  outline: none;
  background: transparent;
  color: white;
}

button {
  padding: 0;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;

  & .icon {
    width: 12px;
    height: 12px;
  }
}
</style>
