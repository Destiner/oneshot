declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_API_BASE_URL?: string;
  };
}
