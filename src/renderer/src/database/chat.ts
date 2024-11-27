import type { Message } from '@renderer/database/message'
import type { ID } from './type'
import { MessageDatabase } from '@renderer/database/message'
import { map } from '@renderer/utils/async'
import { ChatType } from './enums'

export interface Chat {
  id: ID
  type: ChatType
  participants: ID[]
  messages: string[]
  createdAt: Date
  updatedAt: Date
  owner: string
  title: string
  avatar: string
  description: string
  isMuted: boolean
  isTop: boolean
  isHide: boolean
  isGroup: boolean
}

export interface ChatData extends Omit<Chat, 'messages'> {
  messages: Message[]
  lastMessage?: Message
}

export type ChatOption = Omit<Chat, 'createdAt' | 'updatedAt' | 'messages' | 'isMuted' | 'isTop' | 'isHide' | 'description'>

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

  public createChatId() {
    return this.createUUID()
  }

  async createChat(newChat: ChatOption) {
    return await this.createChatByCompleteInfo({
      ...newChat,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      isHide: false,
      isMuted: false,
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
    const oldChat = await this.chats.get(newChat.id)

    if (!oldChat) {
      return await this.createChat({ ...newChat, type: ChatType.PRIVATE_CHAT })
    }
    else {
      // Update the chat
      await this.chats.update(newChat.id, { ...newChat, updatedAt: new Date() })
      return (await this.completeMessage([(await this.chats.get(newChat.id))!])).at(0)!
    }
  }

  async createGroupChat(newChat: Omit<ChatOption, 'type'>) {
    return await this.createChat({ ...newChat, type: ChatType.GROUP_CHAT })
  }

  async completeMessage(chats: Chat[]): Promise<ChatData[]> {
    return await map(chats, async (chat) => {
      const messages = await this.getMessagesByChatId(chat.id)
      const lastMessage = messages.length > 0 ? messages.at(messages.length - 1) : undefined
      return { ...chat, messages, lastMessage }
    })
  }
}

export const chatDatabase = new ChatDatabase()
