import { createApp } from 'vue';
import VueApp from './App.vue';
import vuetify from './plugins/vuetify';
import { config } from 'pixi-live2d-display';
import { App } from '@/app/App';

const app = createApp(VueApp);

app.use(vuetify);

app.directive('visible', (el, binding) => {
    el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});

app.mount('#app');

(window as any).vueApp = app;
(window as any).App = App;
(window as any).config = config;

config.logLevel = config.LOG_LEVEL_VERBOSE;