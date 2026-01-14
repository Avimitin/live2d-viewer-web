import { defineStore } from 'pinia';
import { ModelEntity } from '@/app/ModelEntity';
import { ExtendedFileList, SoundManager } from 'pixi-live2d-display';
import { PixiApp } from '@/app/PixiApp';
import { Live2DModel } from '@/app/Live2DModel';
import Stats from 'stats.js';
import { loadValue, saveValue } from '@/utils/storage';

const stats = new Stats();
stats.showPanel(0);
stats.dom.style.left = '';
stats.dom.style.right = '0';

export const useAppStore = defineStore('app', {
    state: () => ({
        models: [] as ModelEntity[],
        pixiApp: new PixiApp(stats),
        volume: loadValue('volume', SoundManager.volume),
        showStats: loadValue('stats', true),
        showModelFrame: loadValue('modelFrame', false),
        showHitAreaFrames: loadValue('hitAreaFrames', false),
    }),
    actions: {
        init() {
            // Apply initial state side effects
            this.updateStatsVisibility(this.showStats);
            this.updateVolume(this.volume);
            
            // Watchers for persistence and side effects are set up in the component or via subscription
            // But we can also handle them in actions setters
        },
        addModel(source: string | ExtendedFileList): number {
            const model = new ModelEntity(source, this.pixiApp.renderer);

            this.initModel(model);
            this.models.push(model);

            return model.id;
        },
        getModel(id: number) {
            return this.models.find(m => m.id === id);
        },
        initModel(model: ModelEntity) {
            model.on('modelLoaded', async (pixiModel: Live2DModel) => {
                if (!this.pixiApp.stage.children.includes(pixiModel)) {
                    this.pixiApp.stage.addChild(pixiModel);

                    pixiModel.backgroundVisible = this.showModelFrame;
                    pixiModel.hitAreaFrames.visible = this.showHitAreaFrames;
                    pixiModel.position.set(this.pixiApp.renderer.width / 2, this.pixiApp.renderer.height / 2);

                    model.fit(this.pixiApp.renderer.width, this.pixiApp.renderer.height);
                    model.initThumbnail(this.pixiApp.renderer);
                }
            });
        },
        removeModel(id: number) {
            const model = this.models.find(model => model.id === id);

            if (model) {
                this.models.splice(this.models.indexOf(model), 1);

                if (model.pixiModel) {
                    this.pixiApp.stage.removeChild(model.pixiModel);
                }

                model.destroy();
            }
        },
        updateStatsVisibility(visible: boolean) {
            this.showStats = visible;
            saveValue('stats', visible);
            if (visible) {
                document.body.appendChild(stats.dom);
            } else {
                stats.dom.parentElement?.removeChild(stats.dom);
            }
        },
        updateVolume(value: number) {
            this.volume = value;
            saveValue('volume', value);
            SoundManager.volume = value;
        },
        updateModelFrame(visible: boolean) {
            this.showModelFrame = visible;
            saveValue('modelFrame', visible);
            for (const model of this.models) {
                if (model?.pixiModel) {
                    model.pixiModel.backgroundVisible = visible;
                }
            }
        },
        updateHitAreaFrames(visible: boolean) {
            this.showHitAreaFrames = visible;
            saveValue('hitAreaFrames', visible);
            for (const model of this.models) {
                if (model?.pixiModel) {
                    model.pixiModel.hitAreaFrames.visible = visible;
                }
            }
        },
    },
});
