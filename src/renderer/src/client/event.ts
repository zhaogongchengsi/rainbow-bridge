import type { Message } from '@renderer/database/message'
import type { SelfUser } from '@renderer/database/user'
import type { Emitter, Handler } from 'mitt'
import type { DataConnection } from 'peerjs'
import type { BinaryData, ClientError, Data, JsonData, JsonMessageStatusContent, Metadata } from './type'
import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
export type Events = {
  'server:open': string
  'server:error': ClientError
  'server:close': undefined
  'server:connection': undefined

  'peer:connection': [Metadata, DataConnection]
  'peer:data': Data
  'peer:json': JsonData
  'peer:binary': BinaryData

  'chat:message': Message
  'chat:message-state': JsonMessageStatusContent

  'user:login': SelfUser
  'user:logout': SelfUser
}

export type ClientEvent = Emitter<Events>

export type ClientHandler<Key extends keyof Events> = Handler<Events[Key]>

export function createEvent() {
  return mitt<Events>()
}
