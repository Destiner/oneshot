import { load } from '@tauri-apps/plugin-store';

interface UseStore {
  get<T>(key: string): Promise<T | null | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

const VERSION = 3;

function useStore(): UseStore {
  const filename = `store-${VERSION}.json`;

  async function get<T>(key: string) {
    const store = await load(filename, { autoSave: false });
    return store.get<T>(key);
  }

  async function set(key: string, value: unknown) {
    const store = await load(filename, { autoSave: false });
    await store.set(key, value);
  }

  return {
    get,
    set,
  };
}

export default useStore;
