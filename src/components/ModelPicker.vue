<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue',$event)" width="1500" max-width="90vw">
    <v-card height="1000" max-height="90vh" class="d-flex flex-column">
      <v-toolbar color="primary" flat dense class="flex-grow-0">
        <v-toolbar-title>Select a Model</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="submit">
          <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
        </v-btn>
      </v-toolbar>

      <v-row no-gutters class="content-row flex-grow-1">
        <v-col class="content-col">
          <v-treeview activatable return-object :load-children="fetchModels" :active="activeFolders" :items="tree"
                      item-key="id" open-on-click @update:active="$event.length&&(activeFolders=$event)"
                      @update:open="folderOpened">
            <template v-slot:prepend="{ open }">
              <v-icon>
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
            </template>
            <template v-slot:label="{ item }">
                <span :class="{'text-decoration-line-through':item.error}">{{ item.name }}</span>
                <v-chip x-small class="model-count ml-1 px-2 text--secondary">{{ item.modelCount }}</v-chip>
            </template>
          </v-treeview>
        </v-col>

        <v-divider vertical></v-divider>

        <v-col class="content-col">
          <v-list-item-group v-model="selectedFileIndex">
            <v-list-item v-for="(file,i) in activeFolderFiles" :key="file" color="primary"
                         @dblclick.native="selectedFileIndex=i;submit()">
              <v-list-item-content>
                <v-list-item-title>{{ file }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-card-actions>
        <span class="text--secondary text-caption">The listed models were scraped from <a target="_blank"
                                                                             href="https://github.com/Eikanya/Live2d-model">Eikanya/Live2d-model</a>.
          All credit goes to their respective creators.</span>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { xor } from 'lodash-es';
import { getFileURL, getRootNodes, loadRootNode, TreeNode } from '@/app/data';

defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const tree = ref(getRootNodes());
const openedFolders = ref<TreeNode[]>([]);
const activeFolders = ref<TreeNode[]>([]);
const selectedFileIndex = ref(-1);

const activeFolderFiles = computed(() => {
    return activeFolders.value.length ? activeFolders.value[0].files || [] : [];
});

watch(activeFolders, (value: TreeNode[], oldValue: TreeNode[]) => {
    const hasChanged = xor(value, oldValue).length !== 0;

    if (hasChanged) {
        selectedFileIndex.value = -1;
    }
});

async function fetchModels(node: TreeNode) {
    await loadRootNode(node);
}

function folderOpened(newOpenedFolders: TreeNode[]) {
    const diff = xor(newOpenedFolders, openedFolders.value);

    if (diff.length) {
        activeFolders.value = diff.slice(0);
        openedFolders.value = newOpenedFolders;
    } else {
        activeFolders.value = tree.value.slice(0, 1);
    }
}

function submit() {
    if (activeFolders.value.length && selectedFileIndex.value >= 0) {
        const file = getFileURL(activeFolders.value[0], activeFolderFiles.value[selectedFileIndex.value]);

        if (file) {
            emit('select', file);
        }
    }

    emit('update:modelValue', false);
}
</script>

<style scoped lang="stylus">
.content-row
  overflow auto

.content-col
  height 100%
  overflow auto

.model-count
  vertical-align text-top
  pointer-events none
</style>