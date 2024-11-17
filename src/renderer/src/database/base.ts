import type { EntityTable } from 'dexie'
import type { Chat } from './chat'
import type { Identity } from './identit'
import type { Message } from './message'
import Dexie from 'dexie'
import flatMap from 'lodash/flatMap'
import union from 'lodash/union'
import { randomUUID } from 'uncrypto'

export class RainbowBridgeDatabase extends Dexie {
  chats!: EntityTable<Chat, 'id'>
  messages!: EntityTable<Message, 'id'>
  identitys!: EntityTable<Identity, 'id'>
  constructor() {
    super('rainbow-bridge-db')
    this.version(1).stores({
      chats: this.generateDexieStoreString(
        ['id', 'type', 'email', 'isContact', 'createdAt', 'updatedAt', 'owner', 'title'],
        ['participants', 'messages', 'avatar', 'description', 'isMute', 'isTop', 'isHide'],
      ),
      identitys: this.generateDexieStoreString(
        ['id', 'name', 'email'],
        ['chats', 'comment', 'lastLoginTime', 'create_by', 'avatar'],
      ),
      messages: this.generateDexieStoreString(
        ['id', 'senderId', 'receiverId', 'status', 'isLastMessage'],
        ['timestamp', 'content'],
      ),
    })
  }

  createUUID() {
    return randomUUID()
  }

  generateDexieStoreString(searchableKeys: string[], notSearchableKeys: string[] = []): string {
    const isPrimaryKey = (key: string) => key.startsWith('++') ? key.replace('++', '') : key

    const combinations = flatMap(searchableKeys, (key, index) => {
      return searchableKeys.slice(index + 1).map((otherKey) => {
        return `[${isPrimaryKey(key)}+${otherKey}]`
      })
    })

    const searchKeys = searchableKeys.map(key => `[${isPrimaryKey(key)}]`)

    return union([...searchableKeys, ...notSearchableKeys, ...searchKeys, ...combinations]).join(', ')
  }
}
