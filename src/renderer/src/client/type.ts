import type { ClientEvent } from '@renderer/client/event'
import type { Identity } from '@renderer/database/identit'
import type { BufferFile } from '@renderer/utils/ky'
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
  connect: (id: string, metadata: Metadata) => Promise<DataConnection>
}

export type Handler = (...args: any[]) => any | Promise<any>

export type HandlerMapType = Map<keyof Handler, Handler[keyof Handler]>

export type ClientError = PeerError<`${PeerErrorType}`>
export type OpponentError = PeerError<'not-open-yet' | 'message-too-big' | 'negotiation-failed' | 'connection-closed'>

export interface Metadata {
  id: string
  info: Pick<Identity, 'uuid' | 'email' | 'name'> & {
    avatar: BufferFile
  }
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
