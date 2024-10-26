import { Bonjour } from 'bonjour-service'
import { logger } from './logger'

let instance: Bonjour | null = null
const BONJOUR_SERVICE_NAME = 'rainbow-bridge'

export function bonjourInit() {
  logger.info('Bonjour service is initializing.')
  instance = new Bonjour()
}

export function bonjourDestroy() {
  instance?.destroy()
  instance = null
}

export function bonjourPublish() {
  if (!instance) {
    throw new Error('Bonjour is not initialized.')
  }
  instance.publish({
    name: BONJOUR_SERVICE_NAME,
    type: 'http',
    port: 3000
  })
}
