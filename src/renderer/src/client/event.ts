import type { Emitter } from 'mitt'
import type { DataConnection } from 'peerjs'
import type { ClientError } from './type'
import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
export type Events = {
  'server:open': string
  'server:error': ClientError
  'server:close': undefined
  'client:connection': DataConnection
}

export type ClientEvent = Emitter<Events>

export function createEvent() {
  return mitt<Events>()
}
