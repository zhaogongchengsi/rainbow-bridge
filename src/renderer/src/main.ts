import { routes } from 'vue-router/auto-routes'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { MotionPlugin } from '@vueuse/motion'
import { logger } from './utils/logger'
import './styles/config.css'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import './styles/base.css'
import 'primeicons/primeicons.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(MotionPlugin)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

app.mount('#app')

logger.info('Renderer process is started.')

window.fetch('rainbow://test/asdasd/asdasd')
  .then(async (res) => {
    console.log(res)
    return await res.text()
  })
  .then(console.log)
