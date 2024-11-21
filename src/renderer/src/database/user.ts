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

  private cache: Map<string, { user: User, timestamp: number }> = new Map()
  private cacheDuration: number = 3 * 60 * 1000

  constructor() {
    super()
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

  async getUserById(id: string): Promise<User | undefined> {
    const now = Date.now()
    const cached = this.cache.get(id)

    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.user
    }

    const user = await this.users.get(id)
    if (user) {
      this.cache.set(id, { user, timestamp: now })
    }
    return user
  }
}

export const userDatabase = new UserDatabase()
