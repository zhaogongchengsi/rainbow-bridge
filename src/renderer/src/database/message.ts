import type { ID } from './type'
import { RainbowBridgeDatabase } from '@renderer/database/base'
import { logger } from '@renderer/utils/logger'
import { MessageState } from './enums'

export interface Message {
  /**
   * Message ID (UUID)
   */
  id: string
  /**
   * Sender ID
   */
  from: ID
  /**
   * Receiver ID chatId
   */
  to: ID
  /**
   * Message content
   */
  content: string
  /**
   * Message timestamp
   */
  timestamp: number
  /**
   * Message status
   */
  status: MessageState
  /**
   * isText flag 文本消息
   */
  isText: boolean
  /**
   * 图片消息
   */
  isImage: boolean
  /**
   * isAudio flag 音频消息
   */
  isAudio: boolean
  /**
   * isVideo flag 视频消息
   */
  isVideo: boolean
  /**
   *  引用了其他的消息 值为引用消息的id (uuid)
   */
  reference?: string
}

export class MessageDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  createTextMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    const newMessage = {
      ...message,
      id: this.createUUID(),
      timestamp: Date.now(),
      status: MessageState.SENT,
    }
    logger.info(`Create text message: ${JSON.stringify(newMessage)}`)
    return newMessage
  }

  sortMessage(messages: Message[]) {
    return messages.sort((a, b) => a.timestamp - b.timestamp)
  }

  async saveMessage(message: Message) {
    const index = await this.messages.add(message)

    return await this.messages.get(index)
  }

  async getMessagesByChatId(chatId: string) {
    return this.sortMessage(await this.messages.where('to').equals(chatId).toArray())
  }

  async getMessagesByChatIdWithPagination(chatId: string, page: number = 1, pageSize: number = 50) {
    const totalMessages = await this.messages.where('to').equals(chatId).count()
    const totalPage = Math.ceil(totalMessages / pageSize)
    const offset = (page - 1) * pageSize
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
