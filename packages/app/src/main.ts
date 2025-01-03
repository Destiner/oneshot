import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

import App from './App.vue';
import Chat from './pages/Chat.vue';
import Tools from './pages/Tools.vue';
import Providers from './pages/Providers.vue';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/chat/0' },
    { path: '/chat/:index', component: Chat },
    { path: '/tools', component: Tools },
    { path: '/providers', component: Providers },
  ],
});

app.use(pinia);
app.use(router);
app.mount('#app');
