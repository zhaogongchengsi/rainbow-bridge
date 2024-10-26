import ciao, { CiaoService } from '@homebridge/ciao'
import { logger } from './logger'
import { BONJOUR_SERVICE_NAME, BONJOUR_SERVICE_PORT, BONJOUR_SERVICE_TYPE } from './constant'

const responder = ciao.getResponder()

let service: CiaoService | null = null

export function bonjourInit() {
  logger.info('Ciao service is initializing.')
  service = responder.createService({
    name: BONJOUR_SERVICE_NAME,
    type: BONJOUR_SERVICE_TYPE,
    port: BONJOUR_SERVICE_PORT, // optional, can also be set via updatePort() before advertising
    txt: {
      // optional
      id: '12123 zhaozunhong'
    }
  })

  service.on('hostname-change', () => {
    logger.info('Bonjour hostname change.')
  })

  service.on('name-change', (name) => {
    logger.info('Bonjour name change.', name)
  })

  logger.info('Ciao service state is', service.serviceState)
}

export function getBonjour() {
  if (!service) {
    throw new Error('Bonjour is not initialized.')
  }
  return service
}

export function bonjourPublish() {
  const { promise, reject, resolve } = Promise.withResolvers<void>()
  getBonjour().advertise().then(resolve, reject)
  return promise
}
