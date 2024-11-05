import { consola } from 'consola'
import { PeerServer } from 'peer'

function bootstrap() {
  consola.info('server started')

  const peerServer = PeerServer({ port: 9000, path: '/bridge', allow_discovery: true })

  peerServer.on('connection', (client) => {
    consola.info('client connected:', client.getId())
  })

  peerServer.on('disconnect', (client) => {
    consola.info('client disconnected:', client.getId())
  })
}

bootstrap()
