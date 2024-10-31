import type { Identity } from './types/identit'
import Dexie, { type EntityTable } from 'dexie'

export class RainbowBridgeDatabase extends Dexie {
  identitys!: EntityTable<Identity, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      identitys: '++id, uuid, create_by, name, email, avatar, comment, lastLoginTime',
    })
  }
}
