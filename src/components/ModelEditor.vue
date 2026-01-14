<template>
  <div class="model-editor" v-if="model" ref="rootElement">
    <v-list expand v-if="hasPixiModel" v-model:opened="openedGroups">
      <v-list-group value="display">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Display"></v-list-item>
        </template>

        <v-list-item>
          <v-list-item-content>
            <div>
              <v-slider dense class="mt-2" prepend-icon="mdi-magnify" v-model="model.scaleX"
                  :messages="String(model.scaleX)" min="0.01" max="3" step="0.01"></v-slider>
              <v-slider dense class="mt-2" prepend-icon="mdi-rotate-right" v-model="model.rotation"
                  :messages="rotationDeg" min="0" max="6.28" step="0.01"></v-slider>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group value="motions" :data-set="motionCount=motionGroups.reduce((sum, { motions }) => sum + motions.length, 0)">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title :class="{'text--secondary':!motionCount}">Motions ({{ motionCount }})
            </v-list-item-title>
          </v-list-item>
        </template>

        <template v-slot:default>
          <template v-for="motionGroup in motionGroups" :key="motionGroup.name">
            <v-list-subheader class="px-3">{{ motionGroup.name || '(Nameless)' }}</v-list-subheader>
            <v-list-item ripple v-for="(motion,i) in motionGroup.motions" :key="motionGroup.name+i"
                :data-set="active=motionState?.currentGroup===motionGroup.name&&motionState?.currentIndex===i"
                :disabled="!!motion.error" @click="startMotion(motionGroup,i)">
              <div v-if="active" class="motion-progress"></div>
              <v-list-item-content>
                <v-list-item-title :class="{'primary--text':active,'text-decoration-line-through':motion.error}">
                  {{ motion.file.replace('.mtn', '').replace('.motion3.json', '') }}
                </v-list-item-title>
              </v-list-item-content>
              <template v-slot:append>
                <v-icon size="32" color="primary" v-if="active">mdi-play</v-icon>
                <v-progress-circular indeterminate size="20" width="2" v-else-if="(motionState?.reservedGroup===motionGroup.name&&motionState?.reservedIndex===i)
                    ||(motionState?.reservedIdleGroup===motionGroup.name&&motionState?.reservedIdleIndex===i)" />
              </template>
            </v-list-item>
          </template>
        </template>
      </v-list-group>

      <v-list-group value="expressions">
        <template v-slot:activator="{ props }">
           <v-list-item v-bind="props">
            <v-list-item-title :class="{'text--secondary':!expressions.length}">Expressions ({{ expressions.length }})
            </v-list-item-title>
          </v-list-item>
        </template>

        <template v-slot:default>
          <v-list-item ripple
              v-for="(expression,i) in expressions"
              :key="i"
              :data-set="active=currentExpressionIndex===i"
              :disabled="!!expression.error"
              @click="setExpression(i)">
            <v-list-item-content>
              <v-list-item-title :class="{'primary--text':active,'text-decoration-line-through':expression.error}">
                {{ expression.file.replace('.exp.json', '').replace('.exp3.json', '') }}
              </v-list-item-title>
            </v-list-item-content>
            <template v-slot:append>
              <v-icon size="28" color="primary" v-if="active">mdi-emoticon-outline</v-icon>
              <v-progress-circular indeterminate size="20" width="2" v-else-if="pendingExpressionIndex===i" />
            </template>
          </v-list-item>
        </template>
      </v-list-group>

      <v-list-group value="filters">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Filters"></v-list-item>
        </template>

        <div class="mt-3"></div>

        <v-checkbox v-for="filter in filters" v-model="model.filters" class="v-input--reverse mx-3 mt-0" :key="filter"
            :label="filter+(index=>index?` [${index}]`:'')(model.filters.indexOf(filter)+1)"
            :value="filter"></v-checkbox>
      </v-list-group>
    </v-list>
    <template v-else>
      <pre class="pa-3 text--secondary">{{ model.loadingState.text }}</pre>
      <pre v-if="model.error" class="error--text px-3 text-wrap">{{ model.error }}</pre>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { Filter } from '@/app/Filter';
import { Live2DModel } from '@/app/Live2DModel';
import { ModelEntity } from '@/app/ModelEntity';
import { clamp } from 'lodash-es';
import { MotionPriority, MotionState } from 'pixi-live2d-display';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

interface MotionGroupEntry {
    name: string
    motions: {
        file: string;
        error?: unknown;
    }[]
}

interface ExpressionEntry {
    file: string;
    error?: unknown;
}

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
    visible: Boolean,
});

const appStore = useAppStore();

const model = ref<ModelEntity | null | undefined>(null);
const openedGroups = ref(['display']);
const motionGroups = ref<MotionGroupEntry[]>([]);
const motionState = ref<MotionState | null | undefined>(null);
const motionProgressTimerID = ref(-1);

const expressions = ref<ExpressionEntry[]>([]);
const currentExpressionIndex = ref(-1);
const pendingExpressionIndex = ref(-1);

const filters = ref(Object.keys(Filter.filters));
const rootElement = ref<HTMLElement | null>(null);

const hasPixiModel = computed(() => !!motionState.value);
const rotationDeg = computed(() => Math.round((model.value?.rotation || 0) / Math.PI * 180) + '°');
const motionExpand = computed(() => openedGroups.value.includes('motions'));

// Watchers
watch(() => props.id, updateModel, { immediate: true });
watch(() => model.value?.filters, () => model.value?.updateFilters());
watch(() => motionState.value?.currentGroup, updateMotionProgress);

onMounted(() => {
    motionProgressTimerID.value = window.setInterval(updateMotionProgress, 50);
});

onBeforeUnmount(() => {
    resetModel();
    clearInterval(motionProgressTimerID.value);
});

function updateModel() {
    resetModel();

    model.value = appStore.getModel(props.id);

    if (model.value) {
        if (model.value.pixiModel) {
            pixiModelLoaded(model.value.pixiModel);
        } else {
            model.value.once('modelLoaded', pixiModelLoaded);
        }
    }
}

function resetModel() {
    if (model.value) {
        model.value.off('modelLoaded', pixiModelLoaded);
        model.value.pixiModel?.off('expressionSet', expressionSet);
        model.value.pixiModel?.off('expressionReserved', expressionReserved);
        model.value.pixiModel?.internalModel.motionManager?.off('motionLoadError', motionLoadError);
        model.value.pixiModel?.internalModel.motionManager?.expressionManager?.off('expressionLoadError', expressionLoadError);

        motionGroups.value = [];
        motionState.value = undefined;
        model.value = undefined;
    }
}

function pixiModelLoaded(pixiModel: Live2DModel) {
    const motionManager = pixiModel.internalModel.motionManager;
    const groups: MotionGroupEntry[] = [];

    const definitions = motionManager.definitions;

    for (const [group, motions] of Object.entries(definitions)) {
        groups.push({
            name: group,
            motions: motions?.map((motion, index) => ({
                file: motion.file || motion.File || '',
                error: motionManager.motionGroups[group]![index]! === null ? 'Failed to load' : undefined,
            })) || [],
        });
    }

    motionGroups.value = groups;
    motionState.value = motionManager.state;

    const expressionManager = motionManager.expressionManager;
    expressions.value = expressionManager?.definitions.map((expression, index) => ({
        file: expression.file || expression.File || '',
        error: expressionManager!.expressions[index]! === null ? 'Failed to load' : undefined,
    })) || [];

    currentExpressionIndex.value = expressionManager?.expressions.indexOf(expressionManager!.currentExpression) ?? -1;
    pendingExpressionIndex.value = expressionManager?.reserveExpressionIndex ?? -1;

    pixiModel.on('expressionSet', expressionSet);
    pixiModel.on('expressionReserved', expressionReserved);
    motionManager.on('motionLoadError', motionLoadError);
    expressionManager?.on('expressionLoadError', expressionLoadError);
}

function expressionSet(index: number) {
    currentExpressionIndex.value = index;
}

function expressionReserved(index: number) {
    pendingExpressionIndex.value = index;
}

function motionLoadError(group: string, index: number, error: unknown) {
    const motionGroup = motionGroups.value.find(motionGroup => motionGroup.name === group);

    if (motionGroup) {
        motionGroup.motions[index]!.error = error;
    }
}

function expressionLoadError(index: number, error: unknown) {
    expressions.value[index]!.error = error;
}

function startMotion(motionGroup: MotionGroupEntry, index: number) {
    model.value?.pixiModel?.motion(motionGroup.name, index, MotionPriority.FORCE);
}

function setExpression(index: number) {
    model.value?.pixiModel?.expression(index);
}

function updateMotionProgress() {
    if (!(model.value?.pixiModel && motionState.value?.currentGroup !== undefined && motionExpand.value && props.visible && rootElement.value)) {
        return;
    }

    const startTime = model.value.pixiModel.currentMotionStartTime;
    const duration = model.value.pixiModel.currentMotionDuration;
    const progress = clamp((model.value.pixiModel.elapsedTime - startTime) / duration, 0, 1);

    // using a CSS variable can be a lot faster than letting Vue update a style object bound to the element
    // since that will cause the component to re-render
    rootElement.value.style.setProperty('--progress', progress * 100 + '%');
}
</script>

<style scoped lang="stylus">
:deep(.v-list-item)
    padding 0 12px !important

.motion-progress
    position absolute
    z-index -1
    top 0
    bottom 0
    left 0
    right 0
    opacity .24
    background linear-gradient(var(--v-primary-base), var(--v-primary-base)) no-repeat
    background-size var(--progress, 0) auto
</style>