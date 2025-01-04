<template>
  <textarea
    ref="el"
    :value="modelValue"
    :placeholder="placeholder"
    @input="handleInput"
    rows="1"
  />
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick, useTemplateRef } from 'vue';

const modelValue = defineModel<string>();

const {
  minRows = 1,
  maxRows = 8,
  placeholder = '',
} = defineProps<{
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const rootRef = useTemplateRef<HTMLTextAreaElement>('el');

watch(
  () => modelValue.value,
  () => {
    nextTick(adjustHeight);
  },
);

onMounted(() => {
  adjustHeight();
});

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

function adjustHeight() {
  const textarea = rootRef.value;
  if (!textarea) {
    return;
  }
  textarea.style.height = 'auto';
  const lineHeight = Number.parseInt(
    window.getComputedStyle(textarea).lineHeight || '20',
  );
  const minHeight = lineHeight * minRows;
  const maxHeight = lineHeight * maxRows;
  const scrollHeight =
    textarea.scrollHeight < maxRows * lineHeight
      ? textarea.scrollHeight - 16
      : textarea.scrollHeight;
  const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
  textarea.style.height = `${newHeight}px`;
}

defineExpose({
  focus: () => rootRef.value?.focus(),
});
</script>

<style scoped>
textarea {
  width: 100%;
  padding: 8px;
  transition: all 0.25s ease-in-out;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.2;
  resize: none;

  &::placeholder {
    color: #a4a4a4;
  }
}
</style>
