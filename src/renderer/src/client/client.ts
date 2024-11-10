import type { DataConnection, PeerError, PeerOptions } from 'peerjs'
import type { ClientError, ClientProvider, Metadata, OpponentError } from './type'
import { APP_PEER_PROVIDER } from '@renderer/client/constant'
import { createEvent } from '@renderer/client/event'
import { useIdentity } from '@renderer/store/identity'
import { readBufferFromStore } from '@renderer/utils/ky'
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
  const connectionMap = new Map<string, DataConnection>()

  const identity = useIdentity()

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
    if (!identity.currentIdentity) {
      throw new Error('Current identity not found')
    }

    if (!id || !(await hasServerConnection(id))) {
      return undefined
    }

    const avatar = await readBufferFromStore(identity.currentIdentity.avatar)

    console.log(avatar)

    await connectClient(id, {
      id,
      info: {
        avatar,
        uuid: identity.currentIdentity.uuid,
        name: identity.currentIdentity.name,
      },
    })

    return id
  }

  async function connectServer() {
    destroy()
    id.value = await window.system.getID()
    connecting.value = true
    client.value = new Peer(id.value, { ...peerOptions.value, debug: import.meta.env.PROD ? 0 : 3 })
    logger.info('[peer] init', id.value)
  }

  async function onServerOpen(id: string) {
    logger.info('[peer server] open', id)
    connecting.value = false
    connected.value = true
    peerId.value = id
    await execute()
    event.emit('server:open', id)
  }

  function onPeerError(error: ClientError) {
    logger.error('[peer server] error', `${error.type}: ${error.message}`)
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
      setTimeout(connectServer, delay)
    }
    else {
      logger.error('[peer] max retries reached, giving up')
    }
  }

  function opPeerClose() {
    logger.info('[peer server] close')
    connecting.value = false
    connected.value = false
    connectError.value = false
    event.emit('server:close')
  }

  function getMetadata(conn: DataConnection) {
    const metadata = conn.metadata as Metadata
    if (!metadata) {
      logger.error(`[peer] opponent metadata not found: ${conn.connectionId}`)
      throw new Error('Opponent metadata not found')
    }
    return metadata
  }

  function registerOpponentOpen(conn: DataConnection) {
    return () => {
      const metadata = getMetadata(conn)

      connectionMap.set(metadata.id, conn)

      logger.info(`[peer] opponent open ${metadata.id} ${metadata.info.name} ${metadata.info.email}`)
    }
  }

  function registerOpponentData(conn: DataConnection) {
    return () => {
      logger.info(`[peer] opponent data ${getMetadata(conn)}`)
    }
  }

  function registerOpponentClose(conn: DataConnection) {
    return () => {
      const metadata = getMetadata(conn)
      logger.silly(`opponent close :${metadata.id}`)
      connectionMap.delete(metadata.id)
    }
  }

  function registerOpponentError(conn: DataConnection) {
    return (err: OpponentError) => {
      console.error('opponent error', err)
      logger.error(`[peer] opponent error ${getMetadata(conn)} ${err.type} ${err.message}`)
    }
  }

  function opConnection(conn: DataConnection) {
    logger.info(`[peer] connection ${conn.connectionId} ${conn.metadata}`)

    connectionMap.set(conn.connectionId, conn)
    conn.on('open', registerOpponentOpen(conn))
    conn.on('data', registerOpponentData(conn))
    conn.on('close', registerOpponentClose(conn))
    conn.on('error', registerOpponentError(conn))
    event.emit('peer:connection', conn)
  }

  function connectClient(id: string, metadata: Metadata) {
    const { promise, reject, resolve } = Promise.withResolvers<DataConnection>()
    const conn = getClient().connect(id, { metadata })

    conn.once('open', () => {
      logger.info(`[peer client] connected to ${id}`)
      connectionMap.set(id, conn)
      resolve(conn)
    })

    conn.once('error', (error) => {
      connectionMap.delete(id)
      reject(error)
    })

    conn.once('close', () => {
      connectionMap.delete(id)
    })

    return promise
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

  onBeforeUnmount(() => {
    logger.info('[peer] Before Unmount destroy')

    if (client.value) {
      client.value.removeAllListeners()
    }

    Array.from(connectionMap.values()).forEach((conn) => {
      conn.removeAllListeners()
      conn.close()
    })

    destroy()
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
    connectClient,
  })

  onMounted(connectServer)
}
