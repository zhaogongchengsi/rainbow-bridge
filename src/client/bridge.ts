import type { PeerOptions } from 'peerjs'
import Peer from 'peerjs'

export class Bridge {
  id: string
  peer: Peer
  peerId: string | null = null

  constructor(id: string, options?: PeerOptions) {
    this.id = id
    this.peer = new Peer(id, options)
    this.peer.on('open', this.open.bind(this))
    this.peer.on('close', this.close.bind(this))
    this.peer.on('error', this.error.bind(this))
  }

  private open(id: string) {
    this.peerId = id
  }

  private error(error: Error) {
    console.error(error)
  }

  private close() {
    this.peer.destroy()
  }
}
