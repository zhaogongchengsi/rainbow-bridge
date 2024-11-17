import { RainbowBridgeDatabase } from '@renderer/database/base'
import { MessageState } from './enums'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
  status: MessageState
  isLastMessage: boolean
  chatId: string
}

export class MessageDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  createTextMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    const index = this.messages.add({
      ...message,
      id: this.createUUID(),
      timestamp: Date.now(),
      status: MessageState.SENT,
    })
    return this.messages.get(index)
  }

  async getMessagesByChatId(chatId: string) {
    return await this.messages.where('chatId').equals(chatId).toArray()
  }

  async getLastMessageByChatId(chatId: string): Promise<Message | undefined> {
    return await this.messages
      .where({ chatId, isLastMessage: true })
      .last()
  }
}
