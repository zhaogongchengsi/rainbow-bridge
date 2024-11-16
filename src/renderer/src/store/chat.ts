import { type ChatData, chatDatabase } from '@renderer/database/chat'
import once from 'lodash/once'

export const useChat = defineStore('chat', () => {
  const chats = ref<ChatData[]>([])

  async function init() {
    chats.value = await chatDatabase.getChats()
  }

  once(init)()

  return {
    chats,
  }
})
