import type { EntityTable } from 'dexie'
import { RainbowBridgeDatabase } from '@renderer/database/base'

export interface User {
  // peer id
  id: string
  name: string
  avatar?: string
  email?: string
  lastLoginTime?: number
  create_by: number
  isContact: boolean
}

export class UserDatabase extends RainbowBridgeDatabase {
  users!: EntityTable<User, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      users: 'id, create_by, name, email, avatar, lastLoginTime, isContact',
    })
  }
}

export const userDatabase = new UserDatabase()
