import { RainbowBridgeDatabase } from '@renderer/database/base'
import { getClientUniqueId } from '@renderer/utils/id'
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
  isMe: boolean
  comment?: string
}

export type ExchangeUser = Omit<BaseUserInfo, 'avatar'> & { avatar: BufferFile, connectID: string }
export type SelfUser = Omit<BaseUserInfo, 'id'> & { comment?: string }

export class UserDatabase extends RainbowBridgeDatabase {
  private cache: Map<string, { user: User, timestamp: number }> = new Map()
  private cacheDuration: number = 3 * 60 * 1000

  constructor() {
    super()
  }

  async createMe(info: SelfUser) {
    const uuid = this.createUUID()

    const connectID = await getClientUniqueId()

    const index = await this.users.add({
      id: uuid,
      create_by: Date.now(),
      isContact: false,
      name: info.name,
      avatar: info.avatar,
      email: info.email,
      connectID,
      isMe: true,
    })

    return await this.users.get(index)
  }

  async addUser(newUser: ExchangeUser) {
    const avatar = await uploadBufferToStore(newUser.avatar)

    const index = await this.users.add({
      id: newUser.id,
      create_by: Date.now(),
      isContact: false,
      name: newUser.name,
      avatar,
      email: newUser.email,
      connectID: newUser.connectID,
      isMe: false,
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

  async updateUser(user: ExchangeUser): Promise<void> {
    const avatar = await uploadBufferToStore(user.avatar)
    await this.users.update(user.id, {
      name: user.name,
      avatar,
      email: user.email,
      connectID: user.connectID,
    })
  }

  async upsertUser(user: ExchangeUser): Promise<User | undefined> {
    const existingUser = await this.getUserById(user.id)
    if (existingUser) {
      await this.updateUser(user)
    }
    else {
      await this.addUser(user)
    }
    return await this.getUserById(user.id)
  }
}

export const userDatabase = new UserDatabase()
