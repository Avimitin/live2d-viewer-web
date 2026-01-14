import { App } from 'vue';
import { config } from 'pixi-live2d-display';

declare global {
    interface Window {
        vueApp: App;
        config: typeof config;
    }
}
