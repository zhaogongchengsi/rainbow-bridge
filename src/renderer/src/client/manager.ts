import type { DataConnection, Peer } from 'peerjs'
import type { ClientEvent, ClientHandler, Events } from './event'
import type { Data, Handler, Metadata, OpponentError } from './type'
import { SALT } from '@renderer/constants'
import { map, withTimeout } from '@renderer/utils/async'
import { formatDate } from '@renderer/utils/date'
import { decryptBufferToObject, encryptObjectToBuffer } from '@renderer/utils/decrypt'
import { getClientUniqueId } from '@renderer/utils/id'
import { type BufferFile, readBufferFromStore, uploadBufferToStore } from '@renderer/utils/ky'
import { logger } from '@renderer/utils/logger'
import ky from 'ky'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import { randomUUID } from 'uncrypto'
import { server_base_url } from './constant'
import { DataType } from './enums'

export class Manager {
  connectionMap = new Map<string, DataConnection>()
  handlerMap = new Map<string, Handler>()
  event: ClientEvent
  replyMap = new Map<string, PromiseWithResolvers<any>>()

  peer?: Peer
  metadata?: Metadata

  private clientID = ''
  constructor(e: ClientEvent) {
    this.event = e
  }

  async getClientID() {
    if (!this.clientID) {
      this.clientID = await getClientUniqueId()
    }
    return this.clientID
  }

  getMetadata(conn: DataConnection) {
    const metadata = conn.metadata as Metadata
    if (!metadata) {
      logger.error(`[peer] opponent metadata not found: ${conn.connectionId}`)
      throw new Error('Opponent metadata not found')
    }
    return metadata
  }

  registerHandler(name: string, handler: Handler) {
    logger.silly(`register handler: ${name}`)
    this.handlerMap.set(name, handler)
  }

  registerOpponentData(conn: DataConnection) {
    return async (data: any) => {
      const _data = data as Data
      logger.info(`[peer] opponent data id: ${data.id} type:${data.type} time: ${formatDate(data.timestamp)} reply: ${data.replyId}`)

      this.event.emit('peer:data', _data)

      if (_data.type === DataType.JSON) {
        _data.data = await decryptBufferToObject(_data.data, SALT)

        if (_data.resource) {
          for (const [key, bufferFile] of Object.entries(_data.resource)) {
            if (!bufferFile) {
              continue
            }
            const filePath = await uploadBufferToStore(bufferFile)
            set(_data.data, key, filePath)
          }
        }

        this.event.emit('peer:json', _data)
        return
      }

      if (_data.type === DataType.INVOKE) {
        const handler = this.handlerMap.get(_data.name)
        if (handler) {
          try {
            let argv = _data.argv

            if (_data.resource) {
              argv = await map(_data.argv, async (arg) => {
                for (const [key, bufferFile] of Object.entries(_data.resource!)) {
                  if (has(arg, key) && bufferFile) {
                    const filePath = await uploadBufferToStore(bufferFile)
                    set(arg, key, filePath)
                  }
                }
                return arg
              })
            }

            const result = await Promise.resolve(handler(...argv))
            await this.sendReply(conn, _data.replyId, cloneDeep(result), undefined)
          }
          catch (error: any) {
            await this.sendReply(conn, _data.replyId, undefined, error.message)
          }
        }
        else {
          await this.sendReply(conn, _data.replyId, undefined, 'Handler not found')
        }
      }

      if (_data.type === DataType.REPLY) {
        const promise = this.replyMap.get(_data.replyId)
        if (promise) {
          promise.promise.finally(() => {
            this.replyMap.delete(_data.replyId)
          })
          if (_data.response.error) {
            promise.reject(_data.response.error)
          }
          else {
            promise.resolve(_data.response.result)
          }
        }
        return
      }

      if (_data.type === DataType.BINARY) {
        this.event.emit('peer:binary', _data)
      }
    }
  }

  registerOpponentOpen(conn: DataConnection) {
    return () => {
      const metadata = this.getMetadata(conn)

      this.connectionMap.set(metadata.id, conn)

      logger.info(`[peer] opponent open ${metadata.id} ${metadata.info.name} ${metadata.info.email}`)
    }
  }

  registerOpponentClose(conn: DataConnection) {
    return () => {
      const metadata = this.getMetadata(conn)
      logger.silly(`opponent close :${metadata.id}`)
      this.connectionMap.delete(metadata.id)
    }
  }

  registerOpponentError(conn: DataConnection) {
    return (err: OpponentError) => {
      console.error('opponent error', err)
      logger.error(`[peer] opponent error ${this.getMetadata(conn)} ${err.type} ${err.message}`)
    }
  }

  register(conn: DataConnection) {
    conn.on('open', this.registerOpponentOpen(conn))
    conn.on('data', this.registerOpponentData(conn))
    conn.on('close', this.registerOpponentClose(conn))
    conn.on('error', this.registerOpponentError(conn))
  }

  getConnectionById(id: string) {
    return this.connectionMap.get(id)
  }

  hasConnectionById(id: string) {
    return this.connectionMap.has(id)
  }

  addConnection(id: string, conn: DataConnection) {
    this.connectionMap.set(id, conn)
  }

  /**
   * Fetches the list of server connections (peers) from the specified server base URL.
   *
   * @returns A promise that resolves to an array of server connection strings.
   */
  getServerConnections() {
    return ky.get<string[]>(`${server_base_url}/peers`).json()
  }

  /**
   * Checks if there is a server connection with the given ID.
   *
   * @param id - The ID of the server connection to check.
   * @returns A promise that resolves to a boolean indicating whether the server connection exists.
   */
  async hasServerConnection(id: string) {
    return (await this.getServerConnections()).includes(id)
  }

  async sendReply(conn: DataConnection, replyId: string, result?: any, error?: string) {
    const timestamp = Date.now()
    const id = await this.getClientID()

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.REPLY,
      response: {
        result: cloneDeep(result),
        error,
      },
      replyId,
    }

    return await conn.send(sendData)
  }

  async sendJson(conn: DataConnection, data: any, resourceKeys?: string[]) {
    if (data instanceof ArrayBuffer) {
      throw new TypeError('Data is not JSON')
    }

    const timestamp = Date.now()
    const id = await this.getClientID()
    const _data = cloneDeep(data)

    let resource: Record<string, BufferFile | undefined> | undefined

    if (resourceKeys) {
      resource = Object.fromEntries(
        await map(resourceKeys, async (key) => {
          const filePath = get(_data, key)
          if (!filePath) {
            return [key, undefined]
          }
          const bufferFile = await readBufferFromStore(filePath)
          return [key, bufferFile]
        }),
      )
    }

    const sendData: Data = {
      type: DataType.JSON,
      id,
      timestamp,
      // ! Decrypt with your own ID
      data: await encryptObjectToBuffer(cloneDeep(data), SALT),
      resource: resource ?? undefined,
    }

    return conn.send(sendData)
  }

  async sendBinary(conn: DataConnection, data: ArrayBuffer | Uint8Array | Blob) {
    const timestamp = Date.now()
    const id = await this.getClientID()

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.BINARY,
      data: await this.dataToArrayBuffer(data),
    }

    return await conn.send(sendData)
  }

  async invoke<T>(conn: DataConnection, name: string, argv: any[] = [], resourceKeys?: string[]) {
    const promiser = Promise.withResolvers<T>()
    const timestamp = Date.now()
    const id = await this.getClientID()

    const replyId = randomUUID()

    const fileKeys = argv.map(arg => resourceKeys?.map((key) => {
      return { key, path: get(arg, key) }
    }).filter(Boolean) ?? []).flat().filter(Boolean)

    const resource = Object.fromEntries(
      await map(fileKeys, async ({ key, path }) => {
        const bufferFile = await readBufferFromStore(path)
        return [key, bufferFile]
      }),
    )

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.INVOKE,
      name,
      argv,
      replyId,
      resource: isEmpty(resource) ? undefined : resource,
    }

    this.replyMap.set(replyId, promiser)

    await conn.send(sendData)

    return withTimeout(promiser.promise, 30 * 1000)
  }

  async dataToArrayBuffer(data: any): Promise<ArrayBuffer> {
    let buffer: ArrayBuffer

    if (typeof data === 'string') {
      // 将字符串转换为 ArrayBuffer
      const encoder = new TextEncoder()
      buffer = encoder.encode(data).buffer as ArrayBuffer
    }
    else if (data instanceof ArrayBuffer) {
      // 如果已经是 ArrayBuffer，直接返回
      buffer = data
    }
    else if (data instanceof Blob) {
      // 将 Blob 转换为 ArrayBuffer
      return await data.arrayBuffer()
    }
    else if (Array.isArray(data)) {
      // 将数组转换为 ArrayBuffer
      buffer = new Uint8Array(data).buffer
    }
    else if (data instanceof Uint8Array) {
      // 如果是 Uint8Array，直接返回其 buffer
      buffer = ArrayBuffer.prototype.slice.call(data.buffer, 0)
    }
    else {
      // 将对象转换为 JSON 字符串，然后转换为 ArrayBuffer
      const jsonString = JSON.stringify(data)
      const encoder = new TextEncoder()
      buffer = encoder.encode(jsonString).buffer as ArrayBuffer
    }

    return buffer
  }

  unmount() {
    Array.from(this.connectionMap.values()).forEach((conn) => {
      conn.removeAllListeners()
      conn.close()
    })

    this.connectionMap.clear()
    this.peer = undefined
    this.handlerMap.clear()
  }

  mount(peer: Peer) {
    this.peer = peer
  }

  setMetadata(metadata: Metadata) {
    this.metadata = metadata
    this.registerHandler('request:identity', async () => {
      logger.info('request:identity')
      return this.getThisMetadata()
    })
  }

  async invokeIdentity(id: string) {
    const conn = await this.connect(id)
    try {
      return (await this.invoke<Metadata>(conn, 'request:identity')).info
    }
    catch (err) {
      logger.error('request:identity error', err)
      return undefined
    }
  }

  getThisMetadata() {
    if (!this.metadata) {
      throw new Error('Metadata not found setMetadata() required')
    }
    return this.metadata
  }

  getClient() {
    if (!this.peer) {
      throw new Error('Peer not mounted')
    }
    return this.peer
  }

  connect(id: string) {
    const { promise, reject, resolve } = Promise.withResolvers<DataConnection>()

    if (this.hasConnectionById(id)) {
      resolve(this.getConnectionById(id)!)
      return promise
    }

    const conn = this.getClient().connect(id, { metadata: this.getThisMetadata() })

    conn.once('open', () => {
      logger.info(`[peer client] connected to ${id}`)
      this.addConnection(id, conn)
      resolve(conn)
    })

    conn.once('error', (error) => {
      reject(error)
    })

    this.register(conn)

    return promise
  }

  destroy() {
    this.peer?.destroy()
  }

  tryGetClient() {
    return this.peer
  }

  async lazyConnect(id: string) {
    if (!await this.hasServerConnection(id)) {
      throw new Error(`Server connection not found: ${id}`)
    }

    return await this.connect(id)
  }

  on<Key extends keyof Events>(type: Key, handler: ClientHandler<Key>) {
    this.event.on(type, handler)
  }
}
