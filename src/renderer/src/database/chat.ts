import { MessageDatabase } from '@renderer/database/message'

class ChatDatabase extends MessageDatabase {
  constructor() {
    super()
  }
}

export const chatDatabase = new ChatDatabase()
