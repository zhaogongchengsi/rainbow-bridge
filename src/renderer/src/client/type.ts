import type { ClientEvent, ClientHandler, Events } from '@renderer/client/event'
import type { MessageState } from '@renderer/database/enums'
import type { Message } from '@renderer/database/message'
import type { ExchangeUser } from '@renderer/database/user'
import type Peer from 'peerjs'
import type { DataConnection, PeerError, PeerErrorType } from 'peerjs'
import type { Reactive, Ref } from 'vue'
import type { DataType } from './enums'

export type ClientProviderState = Reactive<{
  id: Ref<string | undefined>
  client: Ref<Peer | undefined>
  event: ClientEvent
  connecting: Ref<boolean>
  connected: Ref<boolean>
  connectError: Ref<boolean>
  peerId: Ref<string | undefined>
  retryCount: Ref<number>
  connectionIds: Ref<string[] | null>
}>

export interface ClientProviderMethods {
  destroy: () => void
  getServerConnections: () => Promise<string[]>
  hasServerConnection: (id: string) => Promise<boolean>
  getClient: () => Peer
  tryGetClient: () => Peer | undefined
  registerHandler: (name: string, handler: Handler) => void
  unmount: () => void
  connect: (id: string) => Promise<DataConnection>
  sendJson: (conn: DataConnection, data: any) => Promise<void>
  sendBinary: (conn: DataConnection, data: ArrayBuffer | Uint8Array | Blob) => Promise<void>
  invoke: <T>(id: string, name: string, ...argv: any[]) => Promise<T>
  setMetadata: (metadata: Metadata) => void
  invokeIdentity: (id: string) => Promise<ExchangeUser | undefined>
  sendMessage: (id: string, message: Message) => Promise<void>
  on: <Key extends keyof Events>(type: Key, handler: ClientHandler<Key>) => void
}

export type Handler = (...args: any[]) => any | Promise<any>

export type HandlerMapType = Map<keyof Handler, Handler[keyof Handler]>

export type ClientError = PeerError<`${PeerErrorType}`>
export type OpponentError = PeerError<'not-open-yet' | 'message-too-big' | 'negotiation-failed' | 'connection-closed'>

export interface Metadata {
  id: string
  info: ExchangeUser
}

export interface CommonData {
  id: string
  timestamp: number
}

export interface JsonData extends CommonData {
  type: DataType.JSON
  data: any
}

export interface BinaryData extends CommonData {
  type: DataType.BINARY
  data: ArrayBuffer
}

export interface ReplyData extends CommonData {
  type: DataType.REPLY
  response: {
    result?: boolean
    error?: any
  }
  replyId: string
}

export interface InvokeEData extends CommonData {
  type: DataType.INVOKE
  name: string
  argv: any[]
  replyId: string
}

export type Data = JsonData | BinaryData | ReplyData | InvokeEData

export interface JsonMessageContent {
  type: 'message'
  message: Message
}

export interface JsonMessageStatusContent {
  type: 'message-state'
  id: string
  ack: MessageState
}

export type JsonMessage = JsonMessageContent | JsonMessageStatusContent
