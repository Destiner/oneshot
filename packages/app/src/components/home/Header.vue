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
    </div>
  </div>
</template>

<script setup lang="ts">
import IconSidebar from '@/components/__common/IconSidebar.vue';

defineProps<{
  title: string;
  withSidebar: boolean;
}>();

const emit = defineEmits<{
  'toggle-sidebar': [];
}>();

function handleSidebarIconClick() {
  emit('toggle-sidebar');
}
</script>

<style scoped>
.header {
  --height: 32px;

  display: flex;
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
  flex: 1;
  height: var(--height);
  padding: 8px;
  border-bottom: 1px solid #000;
}

.icon {
  width: 20px;
  height: 18px;
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
}
</style>
