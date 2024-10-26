import { routes } from 'vue-router/auto-routes'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'
import { logger } from './utils/logger'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const pinia = createPinia()

const app = createApp(App)

app.use(router)
app.use(pinia)

app.mount('#app')

logger.info('Renderer process is started.')
