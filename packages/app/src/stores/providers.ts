import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Provider } from '@/services/api';

const useStore = defineStore('providers', () => {
  const providers = ref<Provider[]>([]);

  function setProviders(newProviders: Provider[]) {
    providers.value = newProviders;
  }

  return { providers, setProviders };
});

export default useStore;
