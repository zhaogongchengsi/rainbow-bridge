import type { PeerOptions } from 'peerjs'
import Peer from 'peerjs'

export class Bridge {
  id: string
  peer: Peer
  peerId: string | null = null
  connecting: boolean = false

  constructor(id: string) {
    const options: PeerOptions = {
      port: Number(import.meta.env.RENDERER_VITE_PEER_PORT),
      path: import.meta.env.RENDERER_VITE_PEER_PATH,
      key: import.meta.env.RENDERER_VITE_PEER_KEY,
      host: import.meta.env.RENDERER_VITE_PEER_URL,
    }
    this.id = id
    this.peer = new Peer(id, options)
    this.peer.on('open', this.open.bind(this))
    this.peer.on('close', this.close.bind(this))
    this.peer.on('error', this.error.bind(this))
  }

  private open(id: string) {
    this.connecting = false
    this.peerId = id
  }

  private error(error: Error) {
    console.error(error)
  }

  private close() {
    this.peer.destroy()
  }
}
