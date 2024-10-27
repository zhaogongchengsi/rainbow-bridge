import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import UnoCSS from 'unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      VueRouter({
        routesFolder: [
          {
            src: 'src/renderer/src/pages'
          },
          {
            src: 'src/renderer/src/welcome',
            path: 'welcome/'
          }
        ],
        dts: 'src/renderer/typed-router.d.ts'
      }),
      Components({
        dts: 'components.d.ts'
      }),
      AutoImport({
        imports: ['vue', '@vueuse/core', VueRouterAutoImports, 'pinia'],
        dirs: ['src/renderer/src/composables/**', 'src/renderer/src/utils/**']
      }),
      UnoCSS(),
      vueDevTools()
    ]
  }
})
