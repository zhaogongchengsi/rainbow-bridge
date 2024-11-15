import type { EntityTable } from 'dexie'
import type { BaseUserInfo } from './user'
import { RainbowBridgeDatabase } from './base'

export type IdentityOption = Omit<Identity, 'id' | 'uuid' | 'create_by' | 'chats'>

export interface Identity extends BaseUserInfo {
  comment?: string
  lastLoginTime?: number
  create_by: number
  chats: string[]
}

class IdentityDatabase extends RainbowBridgeDatabase {
  identitys!: EntityTable<Identity, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      identitys: this.generateDexieStoreString(
        ['id', 'uuid', 'name', 'email'],
        ['chats', 'comment', 'lastLoginTime', 'create_by', 'avatar'],
      ),
    })
  }

  async addIdentity(identity: IdentityOption) {
    const uuid = this.createUUID()
    return this.identitys.add({
      id: uuid,
      ...identity,
      create_by: Date.now(),
      chats: [],
    })
  }

  async getIdentitys() {
    // Sort by create time
    return (await this.identitys.toArray()).sort((a, b) => b.create_by - a.create_by)
  }
}

export const identityDatabase = new IdentityDatabase()
