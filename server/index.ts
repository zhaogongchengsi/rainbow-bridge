import { consola } from 'consola'
import { PeerServer } from 'peer'

function bootstrap() {
  consola.info('server started')

  const peerServer = PeerServer({ port: 9000, path: '/bridge' })

  peerServer.on('connection', (client) => {
    consola.info('client connected:', client.getId())
    consola.info('client info:', client.getToken())
    consola.info('client info:', client)
  })

  peerServer.on('disconnect', (client) => {
    consola.info('client disconnected:', client.getId())
  })
}

bootstrap()
