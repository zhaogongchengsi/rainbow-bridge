import type { EntityTable } from 'dexie'
import { RainbowBridgeDatabase } from '@renderer/database/base'
import { type BufferFile, uploadBufferToStore } from '@renderer/utils/ky'

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
  connectID: string
}

export type ExchangeUser = Omit<BaseUserInfo, 'avatar'> & { avatar: BufferFile, connectID: string }

export class UserDatabase extends RainbowBridgeDatabase {
  users!: EntityTable<User, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      users: this.generateDexieStoreString(
        ['id', 'name', 'email', 'isContact', 'connectID'],
        ['isContact', 'lastLoginTime', 'create_by', 'avatar'],
      ),
    })
  }

  async createUser(newUser: ExchangeUser) {
    const [avatar] = await uploadBufferToStore(newUser.avatar)

    const index = await this.users.add({
      id: newUser.id,
      create_by: Date.now(),
      isContact: false,
      name: newUser.name,
      avatar,
      email: newUser.email,
      connectID: newUser.connectID,
    })

    return await this.users.get(index)
  }

  async getUsers() {
    return (await this.users.toArray()).sort((a, b) => b.create_by - a.create_by)
  }
}

export const userDatabase = new UserDatabase()
