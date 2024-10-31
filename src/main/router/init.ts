import { protocol } from 'electron'
import { AppRouter } from '../libs/router'

export function createAppRouter(scheme: string) {
  const router = new AppRouter(scheme, 'app')
  protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ])
  return router
}
