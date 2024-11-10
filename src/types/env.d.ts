/// <reference types="vite/client" />
/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_KEY_PROTOCOL_NAME: string
  readonly VITE_KEY_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv

}
