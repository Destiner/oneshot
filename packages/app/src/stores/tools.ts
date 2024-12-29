import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Tool } from '@/services/api';

const useStore = defineStore('tools', () => {
  const tools = ref<Tool[]>([]);

  function setTools(newTools: Tool[]) {
    tools.value = newTools;
  }

  return { tools, setTools };
});

export default useStore;
