<template>
  <div class="header">
    <div
      v-if="withSidebar"
      class="sidebar"
    >
      <IconSidebar
        @click="handleSidebarIconClick"
        class="icon"
      />
    </div>
    <div
      v-else
      class="no-sidebar"
    >
      <IconSidebar
        @click="handleSidebarIconClick"
        class="icon"
      />
    </div>
    <div class="title-container">
      <span class="title">{{ title }}</span>
      <div class="split" />
      <IconCompose
        class="icon"
        @click="handleComposeIconClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconCompose from '@/components/__common/IconCompose.vue';
import IconSidebar from '@/components/__common/IconSidebar.vue';

defineProps<{
  title: string;
  withSidebar: boolean;
}>();

const emit = defineEmits<{
  'toggle-sidebar': [];
  'new-chat': [];
}>();

function handleSidebarIconClick() {
  emit('toggle-sidebar');
}

function handleComposeIconClick() {
  emit('new-chat');
}
</script>

<style scoped>
.header {
  --height: 32px;

  display: flex;
  flex-shrink: 0;
  align-items: center;
  background: #3b3c3c;
}

.sidebar {
  display: flex;
  width: 250px;
  height: var(--height);
  padding: 8px;
  border-right: 1px solid #000;
  border-bottom: 1px solid transparent;
  background: #2d2f2f;
}

.no-sidebar {
  display: flex;
  height: var(--height);
  padding: 8px;
  border-bottom: 1px solid #000;
}

.title-container {
  display: flex;
  gap: 8px;
  flex: 1;
  align-items: center;
  height: var(--height);
  padding: 8px;
  border-bottom: 1px solid #000;
}

.icon {
  width: 20px;
  height: 20px;
  padding: 6px 10px;
  color: #bcbdbd;

  &:hover {
    border-radius: 4px;
    background-color: #484a4a;
  }
}

.title {
  padding: 8px;
  font-weight: bold;
  cursor: default;
}

.split {
  width: 1px;
  height: 100%;
  background: #5d5e5e;
}
</style>
