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
import { findFileKeys, isFilePath } from '@renderer/utils/object'
import ky from 'ky'
import { cloneDeepWith, isString } from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
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

  /**
   * Retrieves the metadata from a given DataConnection.
   *
   * @param conn - The DataConnection object from which to retrieve the metadata.
   * @returns The metadata associated with the DataConnection.
   * @throws Will throw an error if the metadata is not found.
   */
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

  /**
   * Finds files with buffer data from the provided data object.
   *
   * @param data - The data object to search for files.
   * @param key - An optional key to access a nested object within the data.
   * @returns A promise that resolves to a record of file keys and their corresponding buffer files, or undefined if no files are found.
   */
  private async findFileWithBufferFile(data: any, key?: string) {
    let _data = data

    if (key && has(data, key)) {
      _data = get(data, key) as any
    }

    const files = findFileKeys(_data)

    if (isEmpty(files)) {
      return undefined
    }

    const fileKeys = await map(files, async (file) => {
      return [file, await readBufferFromStore(file)]
    })

    return Object.fromEntries(fileKeys) as Record<string, BufferFile>
  }

  /**
   * Replaces file paths in the provided data with new file paths obtained by uploading the corresponding buffer files.
   *
   * @param data - The data object that may contain file paths to be replaced.
   * @param files - An optional record of buffer files, where the key is the file path and the value is the buffer file.
   * @param key - An optional key to access a nested object within the data.
   * @returns A promise that resolves to the data object with file paths replaced by new file paths from the buffer files.
   */
  private async replaceFileWithBufferFile(data: any, files?: Record<string, BufferFile | undefined>, key?: string) {
    let _data = data

    if (key && has(data, key)) {
      _data = get(data, key) as any
    }

    const fileKeys = findFileKeys(_data)

    if (isEmpty(fileKeys) || !files || isEmpty(files)) {
      return data
    }

    const fileBuffer = Object.fromEntries(
      await map(fileKeys, async (file) => {
        const buffer = files[file]
        if (buffer) {
          const newFile = await uploadBufferToStore(buffer)
          return [file, newFile]
        }

        return [file, undefined]
      }),
    )

    return cloneDeepWith(_data, (value) => {
      if (isString(value) && isFilePath(value) && has(fileBuffer, value)) {
        return get(fileBuffer, value) ?? value
      }
      return undefined
    })
  }

  /**
   * Registers a handler for opponent data received through a DataConnection.
   *
   * @param conn - The DataConnection instance through which data is received.
   * @returns An asynchronous function that processes the received data.
   *
   * The function processes the data based on its type:
   * - For `DataType.JSON`, it decrypts the data and optionally replaces file references with buffer files, then emits a 'peer:json' event.
   * - For `DataType.INVOKE`, it invokes the corresponding handler with the provided arguments and sends a reply with the result or an error message.
   * - For `DataType.REPLY`, it resolves or rejects the corresponding promise based on the response and optionally replaces file references with buffer files.
   * - For `DataType.BINARY`, it emits a 'peer:binary' event.
   *
   * The function also emits a 'peer:data' event with the received data.
   */
  registerOpponentData(conn: DataConnection) {
    return async (data: any) => {
      const _data = data as Data
      logger.info(`[peer] opponent data id: ${data.id} type:${data.type} time: ${formatDate(data.timestamp)} reply: ${data.replyId}`)

      this.event.emit('peer:data', _data)

      if (_data.type === DataType.JSON) {
        _data.data = await decryptBufferToObject(_data.data, SALT)

        if (_data.resource) {
          _data.data = await this.replaceFileWithBufferFile(_data.data, _data.resource)
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
              argv = await this.replaceFileWithBufferFile(_data.argv, _data.resource)
            }

            const result = await Promise.resolve(handler(...argv))

            await this.sendReply(conn, _data.replyId, cloneDeep(result), undefined)
          }
          catch (error: any) {
            await this.sendReply(conn, _data.replyId, undefined, error.message)
          }
        }
        else {
          await this.sendReply(conn, _data.replyId, undefined, `${_data.name} handler not found`)
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
            let _result = _data.response.result
            if (_data.resource) {
              _result = await this.replaceFileWithBufferFile(_data.response.result, _data.resource)
            }
            promise.resolve(_result)
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

      this.event.emit('peer:connection', [metadata, conn])

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

    const data = cloneDeep(result)

    const resource = await this.findFileWithBufferFile(data)

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.REPLY,
      response: {
        result: data,
        error,
      },
      replyId,
      resource,
    }

    return await conn.send(sendData)
  }

  async sendJson(conn: DataConnection, data: any) {
    if (data instanceof ArrayBuffer) {
      throw new TypeError('Data is not JSON')
    }

    const timestamp = Date.now()
    const id = await this.getClientID()
    const _data = cloneDeep(data)

    const resource = await this.findFileWithBufferFile(_data)

    const sendData: Data = {
      type: DataType.JSON,
      id,
      timestamp,
      // ! Decrypt with your own ID
      data: await encryptObjectToBuffer(_data, SALT),
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

  async invoke<T>(conn: DataConnection, name: string, argv: any[] = []) {
    const promiser = Promise.withResolvers<T>()
    const timestamp = Date.now()
    const id = await this.getClientID()

    const replyId = randomUUID()

    const resource = await this.findFileWithBufferFile(argv)

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.INVOKE,
      name,
      argv,
      replyId,
      resource,
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
    try {
      const conn = await this.lazyConnect(id)
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
