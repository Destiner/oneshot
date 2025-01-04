<template>
  <div
    class="tool"
    :class="{ enabled: modelValue.enabled }"
  >
    <div class="header">
      <div class="header-side">
        <img
          :src="modelValue.iconUrl"
          alt="Tool Icon"
          class="icon"
        />
        {{ modelValue.name }}
      </div>
      <OneSwitch
        :model-value="modelValue.enabled"
        @update:model-value="toggleEnabled"
      />
    </div>
    <div class="commands">
      <h2>Commands</h2>
      <div
        v-for="(_, commandId) in modelValue.commands"
        :key="commandId"
        class="command"
      >
        {{ commandId }}
      </div>
    </div>
    <div
      class="params"
      v-if="
        (modelValue.args && modelValue.args.length > 0) ||
        Object.keys(modelValue.env).length > 0
      "
    >
      <h2>Params</h2>
      <div
        class="args"
        v-if="modelValue.args"
      >
        <div
          class="arg"
          v-for="(arg, index) in modelValue.args"
          :key="index"
        >
          <input
            :value="arg"
            :placeholder="arg"
            @input="handleArgInput(index, $event)"
          />
          <button @click="handleRemoveArg(index)">
            <IconMinus class="icon" />
          </button>
        </div>
        <div>
          <button @click="handleAddArg">
            <IconPlus class="icon" />
          </button>
        </div>
      </div>
      <div class="env">
        <form
          v-for="(envValue, envKey) in modelValue.env"
          :key="envKey"
        >
          <label :for="envKey">{{ envKey }}</label>
          <input
            :id="envKey"
            :value="envValue"
            placeholder="Value"
            type="password"
            @input="handleEnvInput(envKey, $event)"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Tool } from '@/services/api';
import OneSwitch from '@/components/__common/OneSwitch.vue';
import IconMinus from '@/components/__common/IconMinus.vue';
import IconPlus from '@/components/__common/IconPlus.vue';

const props = defineProps<{
  modelValue: Tool;
}>();

const emit = defineEmits<{
  'update:modelValue': [tool: Tool];
}>();

function emitUpdate(updates: Partial<Tool>) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...updates,
  });
}

function toggleEnabled(enabled: boolean) {
  emitUpdate({ enabled });
}

function handleAddArg() {
  if (!props.modelValue.args) return;

  emitUpdate({
    args: [...props.modelValue.args, ''],
  });
}

function handleRemoveArg(index: number) {
  if (!props.modelValue.args) return;

  const newArgs = [...props.modelValue.args];
  newArgs.splice(index, 1);
  emitUpdate({ args: newArgs });
}

function handleArgInput(index: number, event: Event) {
  if (!props.modelValue.args) return;

  const argValue = (event.target as HTMLInputElement).value;
  const newArgs = [...props.modelValue.args];
  newArgs[index] = argValue;
  emitUpdate({ args: newArgs });
}

function handleEnvInput(envKey: string, event: Event) {
  if (!props.modelValue.env) return;

  const envValue = (event.target as HTMLInputElement).value;
  emitUpdate({
    env: {
      ...props.modelValue.env,
      [envKey]: envValue,
    },
  });
}
</script>

<style scoped>
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
