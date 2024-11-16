import type { Message } from '@renderer/database/message'
import type { EntityTable } from 'dexie'
import type { ChatType } from './enums'
import { MessageDatabase } from '@renderer/database/message'
import { map } from '@renderer/utils/async'

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

export interface ChatData extends Omit<Chat, 'messages'> {
  messages: Message[]
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

  async createChat(newChat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    const index = await this.chats.add({
      ...newChat,
      id: this.createUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return await this.chats.get(index)
  }

  async getChats() {
    return await this.completeMessage(
      (await this.chats.toArray()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    )
  }

  async completeMessage(chats: Chat[]): Promise<ChatData[]> {
    return await map(chats, async (chat) => {
      const messages = await this.messages.where('id').anyOf(chat.messages).toArray()
      return { ...chat, messages }
    })
  }
}

export const chatDatabase = new ChatDatabase()
