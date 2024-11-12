import type { DataConnection, PeerOptions } from 'peerjs'
import type { ClientError, ClientProviderMethods, ClientProviderState, Metadata } from './type'
import { APP_PEER_PROVIDER_METHODS, APP_PEER_PROVIDER_STATE, peer_options, server_base_url } from '@renderer/client/constant'
import { createEvent } from '@renderer/client/event'
import { useIdentity } from '@renderer/store/identity'
import { decryptClientID } from '@renderer/utils/id'
import { readBufferFromStore } from '@renderer/utils/ky'
import { logger } from '@renderer/utils/logger'
import Peer from 'peerjs'
import { Manager } from './manager'

export function createClientSingle() {
  logger.info(`[peer] create client server url: ${server_base_url}`)

  const id = ref<string>()
  const peerId = ref<string>()
  const client = shallowRef<Peer>()

  const peerOptions = ref<PeerOptions>(peer_options)
  const manager = new Manager()

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
    return manager.getServerConnections()
  }

  /**
   * Checks if there is a server connection with the given ID.
   *
   * @param id - The ID of the server connection to check.
   * @returns A promise that resolves to a boolean indicating whether the server connection exists.
   */
  async function hasServerConnection(id: string) {
    return await manager.hasServerConnection(id)
  }

  async function searchFriend(id: string) {
    try {
      const conn = await connect(id)

      console.log(conn)
    }
    catch (err) {
      console.error(err)
    }
    // return id
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
      const delay = 2 ** retryCount.value * 1000
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

  function opConnection(conn: DataConnection) {
    const meta = conn.metadata as Metadata

    logger.info(`[peer] connection ${meta.id} ${meta}`)

    manager.register(conn)

    event.emit('peer:connection', conn)
  }

  async function connect(id: string, needDecrypt: boolean = true) {
    const { promise, reject, resolve } = Promise.withResolvers<DataConnection | undefined>()

    if (!identity.currentIdentity) {
      throw new Error('Current identity not found')
    }

    let _id = id

    if (needDecrypt) {
      _id = await decryptClientID(id)
    }

    if (!_id || !(await hasServerConnection(_id))) {
      resolve(undefined)
    }

    const metadata = {
      id: await window.system.getID(),
      info: {
        avatar: await readBufferFromStore(identity.currentIdentity.avatar),
        uuid: identity.currentIdentity.uuid,
        name: identity.currentIdentity.name,
      },
    }

    const conn = getClient().connect(_id, { metadata })

    conn.once('open', () => {
      logger.info(`[peer client] connected to ${id}`)
      resolve(conn)
    })

    conn.once('error', (error) => {
      reject(error)
    })

    manager.register(conn)

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

    manager.unmount()

    destroy()
  })

  provide<ClientProviderState>(
    APP_PEER_PROVIDER_STATE,
    reactive({
      id,
      client,
      event,
      connecting,
      connected,
      connectError,
      peerId,
      retryCount,
      connectionIds: data,
    }),
  )

  provide<ClientProviderMethods>(APP_PEER_PROVIDER_METHODS, {
    destroy,
    getServerConnections,
    hasServerConnection,
    searchFriend,
    connect,
    getClient,
    tryGetClient,
  })

  onMounted(connectServer)
}
