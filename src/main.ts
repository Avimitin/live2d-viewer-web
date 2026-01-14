import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueApp from './App.vue';
import vuetify from './plugins/vuetify';
import { config } from 'pixi-live2d-display';
import { useAppStore } from '@/store/app';

const app = createApp(VueApp);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);

app.directive('visible', (el, binding) => {
    el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});

const appStore = useAppStore();
appStore.init();

app.mount('#app');

window.vueApp = app;
window.config = config;

config.logLevel = config.LOG_LEVEL_VERBOSE;