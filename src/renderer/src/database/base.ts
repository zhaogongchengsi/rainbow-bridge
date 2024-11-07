import type { Identity } from './types/identit'
import type { Message } from './types/message'
import Dexie, { type EntityTable } from 'dexie'

export class RainbowBridgeDatabase extends Dexie {
  identitys!: EntityTable<Identity, 'id'>
  messages!: EntityTable<Message, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      identitys: '++id, uuid, create_by, name, email, avatar, comment, lastLoginTime',
      messages: 'id, senderId, receiverId, content, timestamp, status, sequence',
      chats: 'chatId, type, participants, messages, createdAt, updatedAt',
    })
  }
}
