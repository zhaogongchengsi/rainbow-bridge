import Dexie, { type EntityTable } from 'dexie'
import { Identity } from './types/identit'

export class RainbowBridgeDatabase extends Dexie {
  identitys!: EntityTable<Identity, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      identitys: '++id, name, email, avatar, comment, lastLoginTime'
    })
  }
}
