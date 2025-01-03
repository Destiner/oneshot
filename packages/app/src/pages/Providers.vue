<template>
  <div class="content">
    <div class="providers">
      <div
        v-for="provider in providers"
        :key="provider.name"
        class="provider"
      >
        <div class="header">
          <div class="header-side">
            <img
              :src="provider.iconUrl"
              alt="Provider Icon"
              class="icon"
            />
            {{ provider.name }}
          </div>
        </div>
        <div class="models">
          <h2>Models</h2>
          <div
            v-for="model in provider.models"
            :key="model.id"
            class="model"
          >
            {{ model.name }}
          </div>
        </div>
        <form>
          <label for="api-key">API Key</label>
          <input
            id="api-key"
            :value="provider.apiKey"
            type="text"
            @input="handleApiKeyInput(provider.id, $event)"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';

import useEnv from '@/composables/useEnv';
import useStore from '@/composables/useStore';
import ApiService, { type Provider } from '@/services/api';
import useProvidersStore from '@/stores/providers';

const { apiBaseUrl } = useEnv();
const providersStore = useProvidersStore();
const store = useStore();

const api = new ApiService(apiBaseUrl);

const providers = computed(() => providersStore.providers);

onMounted(async () => {
  const storedProviders = await store.get<Provider[]>('providers');
  if (storedProviders && storedProviders.length > 0) {
    providersStore.setProviders(storedProviders);
  } else {
    const newProviders = await api.getProviders();
    providersStore.setProviders(newProviders);
    save();
  }
});

async function save() {
  store.set('providers', providers.value);
}

async function handleApiKeyInput(providerId: string, event: Event) {
  const target = event.target as HTMLInputElement;
  const provider = providers.value.find(
    (provider) => provider.id === providerId,
  );
  if (!provider) {
    return;
  }
  provider.apiKey = target.value;
  await api.setProviderApiKey(provider.id, target.value);
  save();
}
</script>

<style scoped>
.content {
  display: flex;
  flex: 1;
  min-height: 0;
  margin: 16px;
  overflow-y: auto;
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.provider {
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
</style>
