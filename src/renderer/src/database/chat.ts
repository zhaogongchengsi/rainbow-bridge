import type { Message } from '@renderer/database/message'
import { MessageDatabase } from '@renderer/database/message'
import { map } from '@renderer/utils/async'
import { ChatType } from './enums'

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

export type ChatOption = Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'isMute' | 'isTop' | 'isHide' | 'description'>

class ChatDatabase extends MessageDatabase {
  constructor() {
    super()
  }

  async createChatByCompleteInfo(chat: Chat) {
    const index = await this.chats.add(chat)
    const newChat = await this.chats.get(index)
    if (!newChat) {
      throw new Error('Create chat failed')
    }
    return (await this.completeMessage([newChat])).at(0)!
  }

  async createChat(newChat: ChatOption) {
    return await this.createChatByCompleteInfo({
      ...newChat,
      id: this.createUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      isHide: false,
      isMute: false,
      isTop: false,
      description: '',
    })
  }

  async getChats() {
    return await this.completeMessage(
      (await this.chats.toArray()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    )
  }

  async createPrivateChatChat(newChat: Omit<ChatOption, 'type'>) {
    return await this.createChat({ ...newChat, type: ChatType.PRIVATE_CHAT })
  }

  async createGroupChat(newChat: Omit<ChatOption, 'type'>) {
    return await this.createChat({ ...newChat, type: ChatType.GROUP_CHAT })
  }

  async completeMessage(chats: Chat[]): Promise<ChatData[]> {
    return await map(chats, async (chat) => {
      const messages = await this.messages.where('id').anyOf(chat.messages).toArray()
      return { ...chat, messages }
    })
  }
}

export const chatDatabase = new ChatDatabase()
