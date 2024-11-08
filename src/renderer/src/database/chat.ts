import type { Message } from '@renderer/database/message'
import type { EntityTable } from 'dexie'
import type { ChatType } from './enums'
import { MessageDatabase } from '@renderer/database/message'

export interface Chat {
  chatId: string
  type: ChatType
  participants: string[]
  messages: Message[]
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
  chats!: EntityTable<Chat, 'chatId'>
  constructor() {
    super()
    this.version(1).stores({
      chats: 'chatId, type, participants, messages, createdAt, updatedAt',
    })
  }
}

export const chatDatabase = new ChatDatabase()
