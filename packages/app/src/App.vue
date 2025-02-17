<template>
  <div class="app">
    <Header
      :title="title"
      :with-sidebar="withSidebar"
      @toggle-sidebar="handleToggleSidebar"
      @new-chat="handleNewChat"
    />
    <div class="main">
      <Sidebar
        v-if="withSidebar"
        :chats="orderedChats"
      />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import Header from '@/components/_app/Header.vue';
import Sidebar from '@/components/_app/Sidebar.vue';
import useEnv from '@/composables/useEnv';
import useStore from '@/composables/useStore';
import ApiService, { type Provider, type Tool } from '@/services/api';
import useChatsStore, { type Chat } from '@/stores/chats';
import useToolsStore from '@/stores/tools';
import useProvidersStore from '@/stores/providers';
import useUiStore from '@/stores/ui';
import { generateId } from './utils/id';

const { apiBaseUrl } = useEnv();
const store = useStore();
const chatsStore = useChatsStore();
const providersStore = useProvidersStore();
const toolsStore = useToolsStore();
const uiStore = useUiStore();
const withSidebar = ref(true);

const title = computed(() => uiStore.title);
const chats = computed(() => chatsStore.chats);
const tools = computed(() => toolsStore.tools);
const providers = computed(() => providersStore.providers);

const api = new ApiService(apiBaseUrl);

onMounted(async () => {
  const chats = await store.get<Chat[]>('chats');
  if (chats) {
    chatsStore.setChats(chats);
  }

  const storedProviders = await store.get<Provider[]>('providers');
  if (storedProviders && storedProviders.length > 0) {
    providersStore.setProviders(storedProviders);
    for (const provider of providers.value) {
      await api.setProviderApiKey(provider.id, provider.apiKey);
    }
  } else {
    const newProviders = await api.getProviders();
    providersStore.setProviders(newProviders);
    store.set('providers', providers.value);
  }

  const storedTools = await store.get<Tool[]>('tools');
  if (storedTools) {
    toolsStore.setTools(storedTools);
    await api.setTools(storedTools);
  } else {
    const newTools = await api.getTools();
    toolsStore.setTools(newTools);
    store.set('tools', tools.value);
  }
});

function handleToggleSidebar() {
  withSidebar.value = !withSidebar.value;
}

// Reverse the order of the chats
const orderedChats = computed(() => {
  const chatCopy = [...chats.value];
  return chatCopy.reverse();
});

const router = useRouter();
function handleNewChat() {
  chatsStore.chats.push({
    id: generateId(),
    title: null,
    messages: [],
  });
  router.push('/chat/0');
}
</script>

<style>
:root {
  overflow: hidden;
  background: #2f2f2f;
  color: #f6f6f6;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 14px;
  -webkit-user-select: none;
  user-select: none;
}

body {
  margin: 0;
}

#app,
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
