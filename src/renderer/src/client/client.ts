import type { PeerError, PeerErrorType, PeerOptions } from 'peerjs'
import type { ClientProvider } from './type'
import { APP_PEER_PROVIDER } from '@renderer/client/constant'
import { createEvent } from '@renderer/client/event'
import { logger } from '@renderer/utils/logger'
import Peer from 'peerjs'

export function createClientSingle() {
  const id = ref<string>()
  const peerId = ref<string>()
  const client = shallowRef<Peer>()

  const peerOptions = ref<PeerOptions>({
    port: Number(import.meta.env.RENDERER_VITE_PEER_PORT),
    path: import.meta.env.RENDERER_VITE_PEER_PATH,
    key: import.meta.env.RENDERER_VITE_PEER_KEY,
    host: import.meta.env.RENDERER_VITE_PEER_URL,
  })

  const retryCount = ref<number>(0)
  const maxRetries = 5

  const event = shallowRef(createEvent())
  const connecting = ref<boolean>(false)
  const connected = ref<boolean>(false)

  const { data, execute } = useFetch<string[]>(
    `http://${peerOptions.value.host}:${peerOptions.value.port}${peerOptions.value.path}/${peerOptions.value.key}/peers`,
    { immediate: false },
  ).json()

  function destroy() {
    if (client.value) {
      client.value.destroy()
    }
  }

  async function connect() {
    destroy()
    id.value = await window.system.getID()
    connecting.value = true
    client.value = new Peer(id.value, { ...peerOptions.value, debug: import.meta.env.PROD ? 0 : 3 })
    logger.info('[peer] init', id.value)
  }

  async function onServerOpen(id: string) {
    logger.info('[peer] open', id)
    connecting.value = false
    connected.value = true
    peerId.value = id
    await execute()
  }

  function onPeerError(error: PeerError<`${PeerErrorType}`>) {
    logger.error('[peer] error', `${error.type}: ${error.message}`)
    connecting.value = false
    connected.value = false
    if (
      retryCount.value < maxRetries
      && ['socket-error', 'server-error', 'network'].includes(error.type)
    ) {
      retryCount.value++
      const delay = 2 ** retryCount.value * 1000 // Exponential backoff
      logger.info(`[peer] retrying connection (${retryCount.value}/${maxRetries}) in ${delay}ms`)
      setTimeout(connect, delay)
    }
    else {
      logger.error('[peer] max retries reached, giving up')
    }
  }

  watchEffect(() => {
    if (!client.value) {
      return
    }

    // on server open
    client.value.on('open', onServerOpen)
    // on peer error
    client.value.on('error', onPeerError)
  })

  provide<ClientProvider>(APP_PEER_PROVIDER, {
    client,
    event,
    connecting,
    connected,
    peerId,
    retryCount,
    connectionIds: data,
    destroy,
  })

  onMounted(connect)
}
