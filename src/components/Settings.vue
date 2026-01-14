<template>
  <div class="settings pa-3 flex-column flex-grow-1">
    <div>
      <v-slider dense class="mt-4 mb-10" prepend-icon="mdi-volume-high" v-model="volume" :messages="~~(volume*100)+'%'"
                min="0" max="1" step="0.02"></v-slider>

      <v-switch class="v-input--reverse" v-model="hitAreaFrames" label="Show hit area frames"></v-switch>
      <v-switch class="v-input--reverse" v-model="modelFrame" label="Show model frames"></v-switch>
      <v-switch class="v-input--reverse" v-model="stats" label="Show stats"></v-switch>

      <template v-if="currentBackground">
        <v-divider></v-divider>
        <v-list-subheader class="px-0">Background</v-list-subheader>
        <div class="mt-2 d-flex align-center">
          <span>{{ currentBackground }}</span>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="resetBackground">Reset</v-btn>
        </div>
      </template>
    </div>

    <v-spacer></v-spacer>
    <v-divider></v-divider>
    <div class="pt-4 d-flex align-center">
      <v-icon class="mr-2">mdi-github</v-icon>
      <span>View source or report bugs on <a href="https://github.com/guansss/live2d-viewer-web"
                              class="text-decoration-none">GitHub</a></span></div>

    <span class="pt-4 body-2 text--secondary">Last built: {{ lastUpdated }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Background } from '@/tools/Background';
import { useAppStore } from '@/store/app';

declare const __BUILD_TIME__: number;

const appStore = useAppStore();

const lastUpdated = new Date(__BUILD_TIME__).toLocaleString();
const currentBackground = ref(Background.current);

const volume = computed({
    get: () => appStore.volume,
    set: (val) => appStore.updateVolume(val),
});

const stats = computed({
    get: () => appStore.showStats,
    set: (val) => appStore.updateStatsVisibility(val),
});

const hitAreaFrames = computed({
    get: () => appStore.showHitAreaFrames,
    set: (val) => appStore.updateHitAreaFrames(val),
});

const modelFrame = computed({
    get: () => appStore.showModelFrame,
    set: (val) => appStore.updateModelFrame(val),
});


onMounted(() => {
    Background.emitter.on('change', backgroundChanged);
});

onBeforeUnmount(() => {
    Background.emitter.off('change', backgroundChanged);
});

function resetBackground() {
    Background.reset();
}

function backgroundChanged(background: string) {
    currentBackground.value = background;
}
</script>

<style scoped lang="stylus">
.settings
  display flex
</style>