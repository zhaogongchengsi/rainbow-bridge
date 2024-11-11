import type { ClientProvider } from './type'
import { APP_PEER_PROVIDER } from '@renderer/client/constant'

export function usePeerClient() {
  const v = inject<ClientProvider>(APP_PEER_PROVIDER)

  if (!v) {
    throw new Error('Peer client provider not found')
  }

  return v
}
