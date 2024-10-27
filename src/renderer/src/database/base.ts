import Dexie, { type EntityTable } from 'dexie'

export interface Identity {
  id: number
  name: string
  email: string
  avatar: string
}

export class RainbowBridgeDatabase extends Dexie {
  identitys!: EntityTable<Identity, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      identitys: '++id, name, email, avatar'
    })
  }
}
