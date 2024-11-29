import type { ID } from './type'
import { RainbowBridgeDatabase } from '@renderer/database/base'
import { MessageState } from './enums'

export interface Message {
  id: string
  from: ID
  to: ID // chatId
  content: string
  timestamp: number
  status: MessageState
  isText: boolean
  isImage: boolean
}

export class MessageDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  async createTextMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    return this.createOriginalMessage({
      ...message,
      id: this.createUUID(),
      timestamp: Date.now(),
      status: MessageState.SENT,
    })
  }

  sortMessage(messages: Message[]) {
    return messages.sort((a, b) => a.timestamp - b.timestamp)
  }

  async createOriginalMessage(message: Message) {
    const index = await this.messages.add(message)

    return await this.messages.get(index)
  }

  async getMessagesByChatId(chatId: string) {
    return this.sortMessage(await this.messages.where('to').equals(chatId).toArray())
  }

  async getMessagesByChatIdWithPagination(chatId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize
    const totalMessages = await this.messages.where('to').equals(chatId).count()
    const totalPage = Math.ceil(totalMessages / pageSize)
    const messages = await this.messages
      .where('to')
      .equals(chatId)
      .reverse()
      .offset(offset)
      .limit(pageSize)
      .toArray()

    return {
      page,
      pageSize,
      totalPage,
      totalMessages,
      messages: this.sortMessage(messages),
    }
  }

  async getMessageCountByChatId(chatId: string) {
    return await this.messages.where('to').equals(chatId).count()
  }
}
