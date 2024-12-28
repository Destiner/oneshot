import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tsconfigPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [
    tsconfigPaths({
      loose: true,
    }),
    vue(),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
