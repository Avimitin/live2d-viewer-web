# Codebase Review: Live2D Viewer Web

## Overview

This project is a web-based Live2D model viewer built with **Vue.js 3** and **TypeScript**. It utilizes **PixiJS** for rendering (via `pixi-live2d-display`) and **Vuetify** for the user interface. The architecture separates core application logic (`src/app`) from the UI components (`src/components`), creating a distinct separation of concerns.

## Strengths

*   **Modular Architecture**: The decision to separate domain logic (managing models, loading states, PixiJS interaction) into the `src/app` directory keeps Vue components relatively lightweight and focused on presentation.
*   **TypeScript Integration**: The codebase makes extensive use of TypeScript, providing better type safety and developer tooling support. Interfaces like `MotionGroupEntry` help structure data flows.
*   **Performance Optimization**:
    *   In `ModelEditor.vue`, the use of CSS variables (`--progress`) updated via `requestAnimationFrame` (implied by `elapsedTime` loop) instead of Vue reactivity for high-frequency updates is a professional touch to avoid unnecessary re-renders.
    *   Usage of `stats.js` indicates a focus on performance monitoring.
*   **Clean Persistence Layer**: The custom persistence logic is effectively integrated into the state management.
*   **Modern Tooling**: The project uses Vite-compatible structure (implied by `esnext` target) or Vue CLI, with modern ESLint/TS configs.

## Recent Improvements (Verified)

### 1. State Management Modernization (Pinia)
*   **Change**: The project has successfully migrated from a static class-based store (`src/app/App.ts`) to **Pinia** (`src/store/app.ts`).
*   **Benefit**: This aligns with Vue 3 best practices, enabling better devtools support, improved reactivity, and easier testing. The store correctly manages `models`, `pixiApp`, and global settings.

### 2. Vue Component Modernization
*   **Change**: Key components (`App.vue`, `ModelEditor.vue`) have been refactored to use the **Composition API** with `<script setup lang="ts">`.
*   **Benefit**: This results in more concise code, better type inference, and a cleaner separation of logic. The use of `ref`, `computed`, and `watch` is idiomatic.

### 3. Improved Type Safety
*   **Change**: Global objects on `window` are now properly typed in `src/types/global.d.ts`, removing the need for `(window as any)` casts.
*   **Benefit**: Reduces the risk of runtime errors and improves developer experience with autocomplete.

### 4. Direct DOM Manipulation
*   **Change**: Direct access to `this.$el` in `ModelEditor.vue` has been replaced with a template ref (`ref="rootElement"`).
*   **Benefit**: This is safer and more idiomatic in Vue, ensuring the element is correctly targeted even if the component structure changes.

## Areas for Improvement

### 1. Dead Code Cleanup
*   **Observation**: The file `src/app/App.ts` still exists but appears to be superseded by the Pinia store (`src/store/app.ts`).
*   **Recommendation**: Verify if `src/app/App.ts` is completely unused and delete it to avoid confusion.

### 2. Strict Type Refinement
*   **Observation**: `src/app/Live2DModel.ts` still contains some `any` casts (e.g., `(expressionManager as any)._setExpression`).
*   **Recommendation**: Investigate the `pixi-live2d-display` types to see if a safer type assertion (or module augmentation) can be used instead of `any`.

## Code Quality Assessment

*   **Readability**: **Excellent**. The recent refactoring to `<script setup>` has significantly improved component readability.
*   **Maintainability**: **High**. The move to Pinia and Composition API makes the codebase much more approachable for modern Vue developers.
*   **Complexity**: Managed well. The separation of the rendering engine logic from the UI state is a strong architectural choice.

## Recommendations

1.  **Cleanup**: Delete `src/app/App.ts` if it is confirmed to be unused.
2.  **Refine Types**: Try to eliminate the remaining `any` casts in `Live2DModel.ts`.