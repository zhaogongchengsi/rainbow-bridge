import type { MessageState } from '@renderer/database/enums'

export interface Message {
  id?: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
  status: MessageState
  sequence: number
}
