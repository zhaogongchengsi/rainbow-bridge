import type { ClientEvent } from '@renderer/client/event'
import type Peer from 'peerjs'
import type { Ref, ShallowRef } from 'vue'

export interface ClientProvider {
  client: Ref<Peer | undefined>
  event: ShallowRef<ClientEvent>
  connecting: Ref<boolean>
  connected: Ref<boolean>
  connectError: Ref<boolean>
  peerId: Ref<string | undefined>
  retryCount: Ref<number>
  connectionIds: Ref<string[] | null>
  destroy: () => void
}
