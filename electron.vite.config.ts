import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(() => {
  const alias = {
    '@common-types': resolve('src/types'),
  }

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      resolve: {
        alias: {
          ...alias,
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      resolve: {
        alias: {
          ...alias,
        },
      },
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          ...alias,
        },
      },
      plugins: [
        vue(),
        VueRouter({
          routesFolder: [
            {
              src: 'src/renderer/src/pages',
            },
          ],
          dts: 'src/renderer/typed-router.d.ts',
        }),
        Components({
          dts: 'components.d.ts',
        }),
        AutoImport({
          imports: ['vue', '@vueuse/core', VueRouterAutoImports, 'pinia'],
          dirs: ['src/renderer/src/composables/**', 'src/renderer/src/utils/**'],
        }),
        UnoCSS(),
        vueDevTools(),
      ],
    },
  }
})
