import type { DataConnection, PeerOptions } from 'peerjs'
import type { ClientError, ClientProvider } from './type'
import { APP_PEER_PROVIDER } from '@renderer/client/constant'
import { createEvent } from '@renderer/client/event'
import { logger } from '@renderer/utils/logger'
import ky from 'ky'
import Peer from 'peerjs'

const peer_options = {
  port: Number(import.meta.env.RENDERER_VITE_PEER_PORT),
  path: import.meta.env.RENDERER_VITE_PEER_PATH,
  key: import.meta.env.RENDERER_VITE_PEER_KEY,
  host: import.meta.env.RENDERER_VITE_PEER_URL,
}

const server_base_url = `http://${peer_options.host}:${peer_options.port}${peer_options.path}/${peer_options.key}`

export function createClientSingle() {
  logger.info(`[peer] create client server url: ${server_base_url}`)

  const id = ref<string>()
  const peerId = ref<string>()
  const client = shallowRef<Peer>()

  const peerOptions = ref<PeerOptions>(peer_options)

  const retryCount = ref<number>(0)
  const maxRetries = 5

  const event = createEvent()
  const connecting = ref<boolean>(false)
  const connected = ref<boolean>(false)
  const connectError = ref<boolean>(false)

  const { data, execute } = useFetch<string[]>(
    `${server_base_url}/peers`,
    { immediate: false },
  ).json()

  function getClient() {
    if (!client.value) {
      throw new Error('Peer client not initialized')
    }
    return client.value
  }

  function tryGetClient() {
    if (!client.value) {
      return undefined
    }
    return client.value
  }

  function destroy() {
    if (client.value) {
      client.value.destroy()
    }
  }

  /**
   * Fetches the list of server connections (peers) from the specified server base URL.
   *
   * @returns A promise that resolves to an array of server connection strings.
   */
  function getServerConnections() {
    return ky.get<string[]>(`${server_base_url}/peers`).json()
  }

  /**
   * Checks if there is a server connection with the given ID.
   *
   * @param id - The ID of the server connection to check.
   * @returns A promise that resolves to a boolean indicating whether the server connection exists.
   */
  async function hasServerConnection(id: string) {
    return (await getServerConnections()).includes(id)
  }

  async function searchFriend(id: string) {
    if (!id || !(await hasServerConnection(id))) {
      return undefined
    }

    // getClient().connect(id).on('open', () => {

    // })

    return id
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
    event.emit('server:open', id)
  }

  function onPeerError(error: ClientError) {
    logger.error('[peer] error', `${error.type}: ${error.message}`)
    connecting.value = false
    connected.value = false
    connectError.value = true
    event.emit('server:error', error)
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

  function opPeerClose() {
    logger.info('[peer] close')
    connecting.value = false
    connected.value = false
    connectError.value = false
    event.emit('server:close')
  }

  function opConnection(conn: DataConnection) {
    logger.info('[peer] connection')

    // conn.type

    event.emit('client:connection', conn)
  }

  watchEffect(() => {
    if (!client.value) {
      return
    }

    // on server open
    client.value.on('open', onServerOpen)
    // on peer error
    client.value.on('error', onPeerError)
    // on peer close
    client.value.on('close', opPeerClose)
    // on connection
    client.value.on('connection', opConnection)
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
    connectError,
    getServerConnections,
    hasServerConnection,
    searchFriend,
    getClient,
    tryGetClient,
  })

  onMounted(connect)
}
