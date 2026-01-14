<template>
  <v-app>
    <v-navigation-drawer absolute stateless :width="drawerWidth" v-model="drawer" @transitionend="!drawer && (drawerSwitch=true)">
      <v-toolbar color="primary">
        <v-toolbar-title>Live2D Viewer</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn-toggle group rounded v-model="tab">
          <v-btn icon>
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </v-btn-toggle>
        <v-btn icon class="ml-1" @click="showUI(false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <div v-show="tab===undefined" class="model-page">
        <div class="header pa-3">
          <div class="d-flex align-center">
            <div class="text-h4">{{ '#' + selectedModelID }}</div>
            <v-spacer></v-spacer>
            <v-btn icon width="48" height="48" class="mr-n3" @click="creation.dialog=true">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
          <v-tooltip top :disabled="!selectedModelID">
            <template v-slot:activator="{ props }">
              <div :class="['model-name mt-2 text-h5',{valid:selectedModelID}]"
                   @click="selectedModelID&&(modelInfoDialog=true)" v-bind="props">
                {{ selectedModelID ? modelName : 'Press + to create a model' }}
              </div>
            </template>
            Show info
          </v-tooltip>
        </div>

        <v-divider></v-divider>

        <ModelEditor :id="selectedModelID" :visible="drawer&&tab===undefined"/>
      </div>

      <Settings v-show="tab===0"/>
    </v-navigation-drawer>
    <v-main :style="{paddingLeft:`${drawerWidth}px !important`}">
      <v-container fluid class="pa-0 fill-height flex-column">
        <v-spacer></v-spacer>
        <ModelList v-model="selectedModelID" :show="modelList.visible"/>
      </v-container>
      <ModelCreation v-model="creation.dialog" @create="selectedModelID=$event" @error="onError"/>
      <ModelInfo v-model="modelInfoDialog" :id="selectedModelID"/>
    </v-main>

    <v-fab-transition>
      <v-btn fab top left absolute dark color="accent" v-show="drawerSwitch" @click="showUI(true)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>

    <DropZone @create="selectedModelID=$event" @error="onError"/>

    <v-snackbar v-model="snackbar.visible" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar.visible=false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import ModelList from './components/ModelList.vue';
import ModelCreation from './components/ModelCreation.vue';
import ModelEditor from '@/components/ModelEditor.vue';
import DropZone from '@/components/DropZone.vue';
import Settings from '@/components/Settings.vue';
import ModelInfo from '@/components/ModelInfo.vue';
import { Background } from '@/tools/Background';
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const display = useDisplay();

const drawer = ref(true);
const drawerSwitch = ref(false);
const tab = ref<number | undefined>(-1);

const modelList = reactive({
    visible: true,
});

const selectedModelID = ref(0);
const modelInfoDialog = ref(false);

const creation = reactive({
    dialog: false,
    result: null,
});

const snackbar = reactive({
    visible: false,
    message: '',
    timeout: 5000,
});

const drawerWidth = computed(() => {
    return display.xl.value ? 450 : 360;
});

const modelName = computed(() => {
    return appStore.getModel(selectedModelID.value)?.name || '';
});

function showUI(show: boolean) {
    drawer.value = show;
    modelList.visible = show;
    drawerSwitch.value = false;
}

function snack(message: string, timeout: number = 5000) {
    snackbar.message = message;
    snackbar.timeout = timeout;
    snackbar.visible = true;
}

function onError(e: unknown) {
    const message = (e instanceof Error ? e.message : String(e)) || '';

    if (message) {
        snack(message, -1);
    }
}

// Initial setup
onMounted(() => {
    tab.value = undefined;
    creation.dialog = true;

    if (!Background.current) {
        snack('Drag and drop a local image to set the background!');
    }
});
</script>

<style scoped lang="stylus">
:deep(.v-navigation-drawer__content)
  display flex
  flex-direction column

  .v-toolbar
    flex-grow initial !important

:deep(.v-toolbar__content)
  padding-left 12px
  padding-right 12px

.v-btn-toggle > .v-btn.v-btn
  opacity 1

.model-page
  display flex
  flex-direction column
  overflow auto

.model-name.valid
  cursor pointer
  transition color .1s ease-out

  &:hover
    color var(--v-primary-base)

.model-editor
  overflow auto
</style>

<style lang="stylus">
*
  margin: 0
  padding: 0
  box-sizing: border-box

html
  overflow: hidden !important

#canvas
  position: absolute

#app
  pointer-events none

.v-application
  background none !important

.v-btn--fab.v-size--default.v-btn--absolute.v-btn--top
  top: 16px
  pointer-events auto

// https://github.com/vuetifyjs/vuetify/issues/7283#issuecomment-572276385
// Reversed input variant
.v-input--reverse .v-input__slot
  flex-direction: row-reverse
  justify-content: flex-end

  .v-input--selection-controls__input
    margin-right: 0
    margin-left: 8px

  .v-label
    display: block
    flex: 1
</style>