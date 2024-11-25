import { RainbowBridgeDatabase } from '@renderer/database/base'
import { MessageState } from './enums'

export interface Message {
  id: string
  from: string
  to: string // chatId
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

  async createOriginalMessage(message: Message) {
    const index = await this.messages.add(message)

    return await this.messages.get(index)
  }

  async getMessagesByChatId(chatId: string) {
    return await this.messages.where('to').equals(chatId).toArray()
  }
}
