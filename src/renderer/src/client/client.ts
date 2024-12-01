import type { DataConnection, PeerOptions } from 'peerjs'
import type { App } from 'vue'
import type { ClientError, ClientProviderMethods, ClientProviderState, Handler, Metadata } from './type'
import { APP_PEER_PROVIDER_METHODS, APP_PEER_PROVIDER_STATE, peer_options, server_base_url } from '@renderer/client/constant'
import { createEvent } from '@renderer/client/event'
import { logger } from '@renderer/utils/logger'
import Peer from 'peerjs'
import { Connect } from './connect'

export function createClientSingle(app: App) {
  logger.info(`[peer] create client server url: ${server_base_url}`)

  const event = createEvent()

  const id = ref<string>()
  const peerId = ref<string>()
  const client = shallowRef<Peer>()

  const peerOptions = ref<PeerOptions>(peer_options)

  const manager = new Connect(event)

  const retryCount = ref<number>(0)
  const maxRetries = 5

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

  function registerHandler(name: string, handler: Handler) {
    manager.registerHandler(name, handler)
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

  async function connectServer() {
    destroy()
    id.value = await window.system.getID()
    connecting.value = true
    const peer = new Peer(id.value, { ...peerOptions.value, debug: import.meta.env.PROD ? 0 : 3 })
    client.value = peer

    manager.mount(peer)
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

    event.emit('peer:connection', [meta, conn])
  }

  async function connect(id: string) {
    return await manager.connect(id)
  }

  function unmount() {
    logger.info('[peer] Before Unmount destroy')

    if (client.value) {
      client.value.removeAllListeners()
    }

    manager.unmount()

    destroy()
  }

  function setMetadata(metadata: Metadata) {
    manager.setMetadata(metadata)
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

  app.provide<ClientProviderState>(
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

  app.provide<ClientProviderMethods>(APP_PEER_PROVIDER_METHODS, {
    destroy,
    getServerConnections,
    hasServerConnection,
    registerHandler,
    unmount,
    connect,
    getClient,
    tryGetClient,
    setMetadata,
    sendJson: manager.sendJson.bind(manager),
    sendBinary: manager.sendBinary.bind(manager),
    invoke: manager.lazyInvoke.bind(manager),
    invokeIdentity: manager.invokeIdentity.bind(manager),
    sendMessage: manager.sendMessage.bind(manager),
    on: event.on.bind(event),
  })

  app.onUnmount(unmount)

  connectServer()
}
