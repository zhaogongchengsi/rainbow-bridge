import type { ClientEvent } from '@renderer/client/event'
import type { Identity } from '@renderer/database/identit'
import type Peer from 'peerjs'
import type { DataConnection, PeerError, PeerErrorType } from 'peerjs'
import type { Ref, ShallowRef } from 'vue'

export interface ClientProvider {
  client: Ref<Peer | undefined>
  event: ClientEvent
  connecting: Ref<boolean>
  connected: Ref<boolean>
  connectError: Ref<boolean>
  peerId: Ref<string | undefined>
  retryCount: Ref<number>
  connectionIds: Ref<string[] | null>
  destroy: () => void
  getServerConnections: () => Promise<string[]>
  hasServerConnection: (id: string) => Promise<boolean>
  searchFriend: (id: string) => Promise<string | undefined>
  getClient: () => Peer
  tryGetClient: () => Peer | undefined
  connectClient: (id: string, metadata: Metadata) => Promise<DataConnection>
}

export type ClientError = PeerError<`${PeerErrorType}`>

export interface Metadata {
  id: string
  info: Pick<Identity, 'uuid' | 'avatar' | 'email' | 'name'>
}
