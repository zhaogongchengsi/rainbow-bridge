import { routes } from 'vue-router/auto-routes'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { logger } from './utils/logger'
import './styles/config.css'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import './styles/base.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'system'
    }
  }
})

app.mount('#app')

logger.info('Renderer process is started.')
