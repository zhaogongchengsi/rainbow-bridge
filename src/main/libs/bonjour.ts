import { Bonjour, type Browser, Service } from 'bonjour-service'
import { logger } from './logger'

const BONJOUR_SERVICE_NAME = 'rainbow-bridge'
const BONJOUR_SERVICE_TYPE = 'http'

let instance: Bonjour | null = null
let browser: Browser | null = null

export { Service, Browser }

export function bonjourInit() {
  logger.info('Bonjour service is initializing.')
  instance = new Bonjour({}, () => {
    logger.error('Failed to initialize Bonjour service.')
  })
  browser = instance.find({ type: BONJOUR_SERVICE_TYPE })
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
    type: BONJOUR_SERVICE_TYPE,
    port: 3000
  })
}

export function bonjourUnpublish() {
  if (!instance) {
    throw new Error('Bonjour is not initialized.')
  }

  const { promise, resolve } = Promise.withResolvers<void>()

  instance.unpublishAll(() => {
    resolve()
  })

  return promise
}

export function getBonjourBrowser() {
  if (!browser) {
    throw new Error('Bonjour is not initialized.')
  }
  return browser
}
