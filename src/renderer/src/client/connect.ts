import type { DataConnection, PeerOptions } from 'peerjs'
import type { Metadata } from './type'

export class Connect {
  private conn: DataConnection
  private metadata: Metadata
  readonly id: string
  constructor(conn: DataConnection) {
    this.conn = conn
    this.metadata = conn.metadata
    this.id = conn.metadata.id
  }
}
