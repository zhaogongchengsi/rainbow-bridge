import type { Emitter } from 'mitt'
import mitt from 'mitt'

// eslint-disable-next-line ts/consistent-type-definitions
export type Events = {
  foo: string
  bar?: number
}

export type ClientEvent = Emitter<Events>

export function createEvent() {
  return mitt<Events>()
}
