import type { EntityTable } from 'dexie'
import { RainbowBridgeDatabase } from '@renderer/database/base'

export interface BaseUserInfo {
  id: string
  name: string
  avatar: string
  email?: string
}

export interface User extends BaseUserInfo {
  lastLoginTime?: number
  create_by: number
  isContact: boolean
}

export class UserDatabase extends RainbowBridgeDatabase {
  users!: EntityTable<User, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      users: this.generateDexieStoreString(
        ['id', 'name', 'email', 'isContact'],
        ['isContact', 'lastLoginTime', 'create_by', 'avatar'],
      ),
    })
  }

  async createUser(newUser: Omit<User, 'id' | 'create_by' | 'isContact' | 'lastLoginTime'>) {
    const index = await this.users.add({
      ...newUser,
      id: this.createUUID(),
      create_by: Date.now(),
      isContact: false,
    })
    return await this.users.get(index)
  }

  async getUsers() {
    return (await this.users.toArray()).sort((a, b) => b.create_by - a.create_by)
  }
}

export const userDatabase = new UserDatabase()
