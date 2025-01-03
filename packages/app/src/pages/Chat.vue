<template>
  <div class="content">
    <ChatView
      v-if="selectedChat"
      :chat="selectedChat"
      @new-message="handleNewMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import ChatView from '@/components/home/ChatView.vue';
import useChatsStore from '@/stores/chats';
import useStore from '@/composables/useStore';
import useUiStore from '@/stores/ui';

const route = useRoute();
const store = useStore();
const chatsStore = useChatsStore();
const uiStore = useUiStore();

const indexRouteParam = computed(
  () => route.params.index as string | undefined,
);

const selectedChatIndex = computed(() =>
  indexRouteParam.value ? Number.parseInt(indexRouteParam.value) : 0,
);
const chats = computed(() => chatsStore.chats);
const selectedChat = computed(
  () => chats.value[chats.value.length - selectedChatIndex.value - 1],
);
function handleNewMessage() {
  store.set('chats', chatsStore.chats);
}

watch(
  selectedChat,
  (newChat) => {
    if (newChat?.title) {
      uiStore.setTitle(newChat.title);
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
