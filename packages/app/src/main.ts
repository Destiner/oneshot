import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";

import App from "./App.vue";
import Home from "./pages/Home.vue";

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: Home }],
});

app.use(pinia);
app.use(router);
app.mount("#app");
