<template>
  <v-slide-y-reverse-transition>
    <v-sheet v-if="show&&models.length" class="model-list" width="100%">
      <v-item-group mandatory class="flex-grow-1" :model-value="selectedIndex" @update:model-value="select">
        <transition-group class="model-group d-flex pa-1 pa-xl-2" name="move">
          <v-item v-for="(model,i) in models" :key="model.id" v-slot="{ isSelected, toggle }">
            <v-card :color="model.error?'#631f1f':isSelected?'grey darken-2':'grey darken-3'" class="ma-1 ma-xl-2" @click="toggle">
              <v-tooltip top :disabled="!model.error">
                <template v-slot:activator="{ props }">
                  <v-img :src="model.thumbnail" :width="model.error?paneHeight:model.aspectRatio*paneHeight" :height="paneHeight"
                         v-bind="props">
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular v-if="!model.error" indeterminate
                                             color="grey lighten-5"></v-progress-circular>
                        <v-icon v-else>mdi-alert-circle</v-icon>
                      </v-row>
                    </template>

                    <v-card-title class="ml-1 pa-0 flex-nowrap text-subtitle-2 text-xl-subtitle-1">
                      <span class="model-item-title text-truncate">{{ '#' + model.id + ' ' + model.name }}</span>
                      <v-spacer></v-spacer>
                      <v-btn icon v-if="isSelected" @click.stop="remove(model.id)"><v-icon size="20">mdi-close</v-icon>
                      </v-btn>
                    </v-card-title>
                  </v-img>
                </template>
                {{ model.error }}
              </v-tooltip>
            </v-card>
          </v-item>
        </transition-group>
      </v-item-group>
    </v-sheet>
  </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useAppStore } from '@/store/app';

const props = defineProps<{
    modelValue: number;
    show: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const display = useDisplay();
const appStore = useAppStore();

const models = computed(() => appStore.models);

const paneHeight = computed(() => {
    return display.xl.value ? 192 : 144;
});

const selectedIndex = computed(() => {
    return models.value.findIndex(model => model.id === props.modelValue);
});

function select(index: number) {
    const id = models.value[index]?.id ?? 0;
    emit('update:modelValue', id);
}

function remove(id: number) {
    if (models.value.length === 1) {
        emit('update:modelValue', 0);
    }
    appStore.removeModel(id);
}
</script>

<style scoped lang="stylus">
.model-list
  position relative
  background-color transparent !important
  pointer-events auto

  &:before
    content ''
    position absolute
    top 0
    right 0
    bottom 0
    left 0
    background-color rgba(0, 0, 0, .3)

.model-group
  overflow auto

.v-card
  pointer-events auto

.model-item-title
  line-height 36px

// animation

.move-move
  transition transform .2s
</style>