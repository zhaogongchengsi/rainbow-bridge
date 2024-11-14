import type { DataConnection } from 'peerjs'
import type { ClientEvent } from './event'
import type { Data, Handler, Metadata, OpponentError } from './type'
import { SALT } from '@renderer/constants'
import { withTimeout } from '@renderer/utils/async'
import { formatDate } from '@renderer/utils/date'
import { decryptBufferToObject, encryptObjectToBuffer } from '@renderer/utils/decrypt'
import { getClientID } from '@renderer/utils/id'
import { logger } from '@renderer/utils/logger'
import ky from 'ky'
import cloneDeep from 'lodash/cloneDeep'
import { randomUUID } from 'uncrypto'
import { server_base_url } from './constant'
import { DataType } from './enums'

export class Manager {
  connectionMap = new Map<string, DataConnection>()
  handlerMap = new Map<string, Handler>()
  event: ClientEvent
  replyMap = new Map<string, PromiseWithResolvers<any>>()
  private clientID = ''
  constructor(e: ClientEvent) {
    this.event = e
  }

  async getClientID() {
    if (!this.clientID) {
      this.clientID = await getClientID()
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

      logger.info(`[peer] opponent data id: ${data.id} time: ${formatDate(data.timestamp)} reply: ${data.reply}`)

      this.event.emit('peer:data', _data)

      if (_data.type === DataType.JSON) {
        _data.data = decryptBufferToObject(_data.data, SALT)
        this.event.emit('peer:json', _data)
        return
      }

      if (_data.type === DataType.INVOKE) {
        const handler = this.handlerMap.get(_data.name)
        if (handler) {
          try {
            const result = await Promise.resolve(handler(..._data.argv))
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

  async sendJson(conn: DataConnection, data: any) {
    if (data instanceof ArrayBuffer) {
      throw new TypeError('Data is not JSON')
    }

    const timestamp = Date.now()
    const id = await this.getClientID()

    const sendData: Data = {
      type: DataType.JSON,
      id,
      timestamp,
      // ! Decrypt with your own ID
      data: encryptObjectToBuffer(cloneDeep(data), SALT),
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

  async invoke<T>(conn: DataConnection, name: string, ...argv: any[]) {
    console.log('invoke', name, argv)

    const promiser = Promise.withResolvers<T>()
    const timestamp = Date.now()
    const id = await this.getClientID()

    const replyId = randomUUID()

    const sendData: Data = {
      id,
      timestamp,
      type: DataType.INVOKE,
      name,
      argv,
      replyId,
    }

    this.replyMap.set(replyId, promiser)

    await conn.send(sendData)

    return withTimeout(promiser.promise, 10 * 1000)
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
  }
}
