import type { Plugin } from 'vue'
import { createClientSingle } from './client'

export const clientPlugin: Plugin = {
  install(app) {
    createClientSingle(app)
  },
}
