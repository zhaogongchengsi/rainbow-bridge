import type { EntityTable } from 'dexie'
import type { Chat } from './chat'
import type { FolderSpace } from './folder'
import type { Message } from './message'
import type { User } from './user'
import Dexie from 'dexie'
import { randomUUID } from 'uncrypto'

export class RainbowBridgeDatabase extends Dexie {
  chats!: EntityTable<Chat, 'id'>
  messages!: EntityTable<Message, 'id'>
  users!: EntityTable<User, 'id'>
  folders!: EntityTable<FolderSpace, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      chats: `
        id, type, email, isContact, createdAt, updatedAt, owner, title,
        participants, messages, avatar, description, isMuted, isTop,
        isHide, isGroup
      `,

      messages: `
        id, from, to, content, timestamp, status, chatId, isText, isImage, isAudio,
        isVideo, reference
      `,

      users: `
        id, name, email, isContact, connectID, lastLoginTime, create_by, avatar, comment, isMe,
        [name+email], [name+connectID], [email+connectID], [name+email+connectID]
      `,

      folders: `uuid, id, user, root, lastSyncTime, size, ignore`,
    })
  }

  createUUID() {
    return randomUUID()
  }
}
