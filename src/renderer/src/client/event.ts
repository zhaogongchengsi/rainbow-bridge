import type { Message } from '@renderer/database/message'
import type { Emitter } from 'mitt'
import type { DataConnection } from 'peerjs'
import type { BinaryData, ClientError, Data, JsonData } from './type'
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
}

export type ClientEvent = Emitter<Events>

export function createEvent() {
  return mitt<Events>()
}
