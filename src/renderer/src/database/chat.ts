import type { EntityTable } from 'dexie'
import type { ChatType } from './enums'
import { MessageDatabase } from '@renderer/database/message'

export interface Chat {
  id: string
  type: ChatType
  participants: string[]
  messages: string[]
  createdAt: Date
  updatedAt: Date
  owner: string
  title: string
  avatar: string
  description: string
  isMute: boolean
  isTop: boolean
  isHide: boolean
}

class ChatDatabase extends MessageDatabase {
  chats!: EntityTable<Chat, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      chats: this.generateDexieStoreString(
        ['id', 'type', 'email', 'isContact', 'createdAt', 'updatedAt', 'owner', 'title'],
        ['participants', 'messages', 'avatar', 'description', 'isMute', 'isTop', 'isHide'],
      ),
    })
  }
}

export const chatDatabase = new ChatDatabase()
