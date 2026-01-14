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
          <v-btn color="blue-grey" class="mr-4" @click="$refs.fileInput.click()">Open Files <v-icon right>mdi-folder-open</v-icon></v-btn>

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

<script lang="ts">
import { defineComponent } from 'vue';
import ModelPicker from './ModelPicker.vue';
import { validateURL } from '@/app/data';
import { App } from '@/app/App';
import { uploadFiles } from '@/app/upload';
import { ExtendedFileList } from 'pixi-live2d-display';

export default defineComponent({
    components: { ModelPicker },

    name: "ModelCreation",
    props: {
        modelValue: Boolean,
    },
    data: () => ({
        url: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',

        dropHelpDialog: false,

        picker: {
            dialog: false,
        },

        urlError: false,
        urlMessages: [] as string[],
    }),
    watch: {
        url(value) {
            const message = validateURL(value) || '';

            this.urlError = /error/i.test(message);
            this.urlMessages = [message].filter(Boolean);
        },
    },
    methods: {
        async onFileChange(e: Event) {
            const input = e.target as HTMLInputElement;

            if (input.files?.length) {
                const files = Array.from(input.files);
                await this.uploadModel(files);
                input.value = '';
            }
        },
        async uploadModel(files: File[]) {
            try {
                const settingsArray = await uploadFiles(files);

                let id: number;

                if (settingsArray.length) {
                    for (const settings of settingsArray) {
                        const fileList = files.slice() as ExtendedFileList;

                        fileList.settings = settings;

                        id = App.addModel(fileList);
                    }
                } else {
                    id = App.addModel(files);
                }

                this.$emit('update:modelValue', false);
                this.$emit('create', id!);
            } catch (e) {
                (e as Error).message = 'Failed to load model: ' + (e as Error).message;

                this.$emit('error', e);
            }
        },
        create() {
            this.url = this.url.replace(/\s/, '');

            if (!this.url) {
                this.urlError = true;
                this.urlMessages = ['Please enter a URL'];
            }

            if (this.urlError) {
                return;
            }

            const id = App.addModel(this.url);

            this.$emit('update:modelValue', false);
            this.$emit('create', id);
        },
    },
});
</script>

<style scoped lang="stylus">

</style>