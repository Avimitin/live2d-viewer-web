<template>
  <div :class="['drop-zone', {active:draggingOver}]">
    <div v-if="draggingOver" class="text-h1">Drop Files</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadFiles } from '@/app/upload';
import { isDraggingFile, readFiles } from '@/utils/file';
import { ExtendedFileList } from 'pixi-live2d-display';
import { Background } from '@/tools/Background';
import { useAppStore } from '@/store/app';

const emit = defineEmits(['create', 'error']);
const appStore = useAppStore();

const draggingOver = ref(false);

onMounted(() => {
    document.ondragenter = e => isDraggingFile(e) && (draggingOver.value = true);
    document.ondragleave = e => isDraggingFile(e) && (draggingOver.value = !!e.relatedTarget);
    document.ondragover = e => isDraggingFile(e) && e.preventDefault();
    document.ondrop = e => isDraggingFile(e) && drop(e);
});

async function drop(e: DragEvent) {
    e.preventDefault();

    draggingOver.value = false;

    if (e.dataTransfer?.items.length) {
        const files = await readFiles(e.dataTransfer.items);

        if (files.length === 1 && files[0].type.includes('image')) {
            Background.set(files[0]).catch(console.warn);
        } else {
            uploadModel(files).then();
        }
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

        emit('create', id!);
    } catch (e: unknown) {
        if (e instanceof Error) {
            e.message = 'Failed to load model: ' + e.message;
        }
        emit('error', e);
    }
}
</script>

<style scoped lang="stylus">
.drop-zone
  position fixed
  z-index 9999
  top: 0
  right: 0
  bottom: 0
  left: 0
  display flex
  align-items center
  justify-content center
  transition background-color ease-out .2s

  &.active
    background rgba(0, 0, 0, .3)
</style>