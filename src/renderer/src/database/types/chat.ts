import type { Message } from './message'

export interface Chat {
  chatId: string
  type: 'private' | 'group'
  participants: string[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
