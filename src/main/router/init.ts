import { protocol } from 'electron'
import { PROTOCOL_HOST, PROTOCOL_NAME } from '../libs/constant'
import { AppRouter } from '../libs/router'

export function createAppRouter(scheme: string) {
  const router = new AppRouter(PROTOCOL_NAME, PROTOCOL_HOST)
  protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ])
  return router
}
