import { PeerServer } from 'peer'

const peerServer = PeerServer({ port: 9000, path: '/bridge' })

peerServer.on('connection', (client) => {
  console.log('client connected:', client.getId())
})

peerServer.on('disconnect', (client) => {
  console.log('client disconnected:', client.getId())
})
