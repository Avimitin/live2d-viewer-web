declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $live2dApp: import('@/app/Live2DApp').Live2DApp;
  }
}