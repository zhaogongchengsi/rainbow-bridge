import type { ClientProvider } from './type'
import { APP_PEER_PROVIDER } from '@renderer/client/constant'

export function usePeerClient() {
  return inject<ClientProvider>(APP_PEER_PROVIDER)
}
