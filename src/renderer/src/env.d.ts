/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

interface ImportMetaEnv {
  readonly RENDERER_VITE_PEER_PORT: string
  readonly RENDERER_VITE_PEER_PATH: string
  readonly RENDERER_VITE_PEER_KEY: string
  readonly RENDERER_VITE_PEER_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
