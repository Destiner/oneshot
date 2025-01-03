import { defineStore } from 'pinia';
import { ref } from 'vue';

const useStore = defineStore('ui', () => {
  const title = ref<string>('');

  function setTitle(newTitle: string) {
    title.value = newTitle;
  }

  return { title, setTitle };
});

export default useStore;
