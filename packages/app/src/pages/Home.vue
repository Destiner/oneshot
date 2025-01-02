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
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import ChatView from '@/components/home/ChatView.vue';
import useChatsStore from '@/stores/chats';
import useStore from '@/composables/useStore';

const route = useRoute();
const store = useStore();
const chatsStore = useChatsStore();

const indexRouteParam = computed(
  () => route.params.index as string | undefined,
);

const selectedChatIndex = computed(() =>
  indexRouteParam.value ? Number.parseInt(indexRouteParam.value) : 0,
);
const selectedChat = computed(() => chatsStore.chats[selectedChatIndex.value]);
function handleNewMessage() {
  store.set('chats', chatsStore.chats);
}
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
}
</style>
