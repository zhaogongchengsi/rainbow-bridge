import { protocol } from 'electron'
import { AppRouter } from '../libs/router'

export function createAppRouter(scheme: string) {
  const router = new AppRouter(scheme, 'app')
  protocol.registerSchemesAsPrivileged([
    {
      scheme: scheme,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        stream: true
      }
    }
  ])
  router.get('/', () => {
    return new Response('Hello, World!', { status: 200 })
  })
  return router
}
