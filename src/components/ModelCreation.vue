<template>
  <v-dialog :model-value="modelValue" width="800" @update:model-value="$emit('update:modelValue',$event)">
    <v-card>
      <v-toolbar color="primary" flat dense class="flex-grow-0">
        <v-toolbar-title>Create Model</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="create">
          <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-8">
        <v-text-field single-line filled label="URL" v-model="url" :messages="urlMessages"
                      :error="urlError" @keyup.enter="create"></v-text-field>

        <div class="d-flex align-center">
          <v-btn icon small color="grey" @click="dropHelpDialog=true"><v-icon size="20">mdi-help-circle</v-icon></v-btn>
          <span>Drag and drop supported</span>

          <v-spacer></v-spacer>

          <input type="file" ref="fileInput" multiple style="display: none" @change="onFileChange" accept=".json,.moc,.moc3,.png,.jpg,.jpeg,.zip,.mtn,.motion3.json,.physics.json,.physics3.json,.pose.json,.pose3.json">
          <input type="file" ref="folderInput" webkitdirectory directory style="display: none" @change="onFileChange">
          <v-btn color="blue-grey" class="mr-4" @click="fileInput?.click()">Open Files <v-icon right>mdi-file-multiple</v-icon></v-btn>
          <v-btn color="blue-grey" class="mr-4" @click="folderInput?.click()">Open Folder <v-icon right>mdi-folder-open</v-icon></v-btn>

          <v-btn color="blue-grey" @click="picker.dialog=true">From source...<v-icon right>
            mdi-cloud-search</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog width="1000" max-width="80vw" v-model="dropHelpDialog">
      <v-img src="drop.jpg" @click="dropHelpDialog=false"></v-img>
    </v-dialog>
    <ModelPicker v-model="picker.dialog" @select="url=$event"/>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import ModelPicker from './ModelPicker.vue';
import { validateURL } from '@/app/data';
import { useAppStore } from '@/store/app';
import { uploadFiles } from '@/app/upload';
import { ExtendedFileList } from 'pixi-live2d-display';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'create', 'error']);

const appStore = useAppStore();

const url = ref('https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json');
const dropHelpDialog = ref(false);
const picker = reactive({
    dialog: false,
});
const urlError = ref(false);
const urlMessages = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const folderInput = ref<HTMLInputElement | null>(null);

watch(url, (value) => {
    const message = validateURL(value) || '';

    urlError.value = /error/i.test(message);
    urlMessages.value = [message].filter(Boolean);
});

async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;

    if (input.files?.length) {
        const files = Array.from(input.files);
        await uploadModel(files);
        input.value = '';
    }
}

async function uploadModel(files: File[]) {
    try {
        const settingsArray = await uploadFiles(files);

        let id: number;

        if (settingsArray.length) {
            for (const settings of settingsArray) {
                const fileList = files.slice() as ExtendedFileList;

                fileList.settings = settings;

                id = appStore.addModel(fileList);
            }
        } else {
            id = appStore.addModel(files);
        }

        emit('update:modelValue', false);
        emit('create', id!);
    } catch (e: unknown) {
        if (e instanceof Error) {
            e.message = 'Failed to load model: ' + e.message;
        }

        emit('error', e);
    }
}

function create() {
    url.value = url.value.replace(/\s/, '');

    if (!url.value) {
        urlError.value = true;
        urlMessages.value = ['Please enter a URL'];
    }

    if (urlError.value) {
        return;
    }

    const id = appStore.addModel(url.value);

    emit('update:modelValue', false);
    emit('create', id);
}
</script>

<style scoped lang="stylus">

</style>
