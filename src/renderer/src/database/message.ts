import type { EntityTable } from 'dexie'
import type { MessageState } from './enums'
import { RainbowBridgeDatabase } from '@renderer/database/base'

export interface Message {
  id?: string
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
}

export const messageDatabase = new MessageDatabase()
