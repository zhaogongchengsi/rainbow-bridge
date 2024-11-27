import { resolve } from 'node:path'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
    },
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
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
      resolvers: [PrimeVueResolver()],
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core', VueRouterAutoImports, 'pinia'],
      dirs: ['src/renderer/src/composables/**', 'src/renderer/src/utils/**'],
    }),
    UnoCSS(),
    vueDevTools(),
  ],
})
