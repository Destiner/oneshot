<template>
  <Header
    :title
    :with-sidebar
    @toggle-sidebar="handleToggleSidebar"
  />
  <div class="content">
    <SidebarHistory v-if="withSidebar" />
    <ChatView />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Header from '@/components/home/Header.vue';
import SidebarHistory from '@/components/home/SidebarHistory.vue';
import ChatView from '@/components/home/ChatView.vue';

const withSidebar = ref(false);
const title = ref('Home');

function handleToggleSidebar() {
  withSidebar.value = !withSidebar.value;
}
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
}
</style>
