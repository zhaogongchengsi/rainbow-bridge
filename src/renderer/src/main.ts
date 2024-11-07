import Aura from '@primevue/themes/aura'
import { MotionPlugin } from '@vueuse/motion'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import { logger } from './utils/logger'
import './styles/config.css'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import './styles/base.css'
import 'primeicons/primeicons.css'
import 'splitpanes/dist/splitpanes.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(MotionPlugin)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')

logger.info('Renderer process is started.')
