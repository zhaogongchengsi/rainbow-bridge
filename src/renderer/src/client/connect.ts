import type { ClientEvent } from './event'
import { Manager } from './manager'

export class Connect extends Manager {
  constructor(e: ClientEvent) {
    super(e)
  }
}
