import type { ChatType } from '@renderer/database/enums'
import type { Message } from './message'

export interface Chat {
  chatId: string
  type: ChatType
  participants: string[]
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
