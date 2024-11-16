import type { EntityTable } from 'dexie'
import { RainbowBridgeDatabase } from '@renderer/database/base'
import { MessageState } from './enums'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
  status: MessageState
}

export class MessageDatabase extends RainbowBridgeDatabase {
  messages!: EntityTable<Message, 'id'>
  constructor() {
    super()
    this.version(1).stores({
      messages: 'id, senderId, receiverId, content, timestamp, status, sequence',
    })
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
}
