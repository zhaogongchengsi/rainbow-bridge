import type { Message } from '@renderer/database/message'
import type { Emitter, Handler } from 'mitt'
import type { DataConnection } from 'peerjs'
import type { BinaryData, ClientError, Data, JsonData, JsonMessage, JsonMessageStatusContent } from './type'
import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
export type Events = {
  'server:open': string
  'server:error': ClientError
  'server:close': undefined
  'peer:connection': DataConnection
  'peer:data': Data
  'peer:json': JsonData
  'peer:binary': BinaryData

  'chat:message': Message
  'chat:message-state': JsonMessageStatusContent
}

export type ClientEvent = Emitter<Events>

export type ClientHandler<Key extends keyof Events> = Handler<Events[Key]>

export function createEvent() {
  return mitt<Events>()
}
