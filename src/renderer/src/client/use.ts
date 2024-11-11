import type { ClientProviderMethods, ClientProviderState } from './type'
import { APP_PEER_PROVIDER_METHODS, APP_PEER_PROVIDER_STATE } from '@renderer/client/constant'

export function usePeerClientState() {
  const v = inject<ClientProviderState>(APP_PEER_PROVIDER_STATE)

  if (!v) {
    throw new Error('Peer client provider not found')
  }

  return v
}

export function usePeerClientMethods() {
  const v = inject<ClientProviderMethods>(APP_PEER_PROVIDER_METHODS)

  if (!v) {
    throw new Error('Peer client provider not found')
  }

  return v
}
