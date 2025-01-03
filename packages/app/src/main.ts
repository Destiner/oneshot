import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

import App from './App.vue';
import Home from './pages/Home.vue';
import Tools from './pages/Tools.vue';
import Providers from './pages/Providers.vue';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:index', component: Home },
    { path: '/tools', component: Tools },
    { path: '/providers', component: Providers },
  ],
});

app.use(pinia);
app.use(router);
app.mount('#app');
