import { type ChatData, chatDatabase, type ChatOption } from '@renderer/database/chat'
import once from 'lodash/once'

export const useChat = defineStore('app-chat', () => {
  const chats = ref<ChatData[]>([])

  async function init() {
    chats.value = await chatDatabase.getChats()
  }

  once(init)()

  async function createPrivateChatChat(newChat: Omit<ChatOption, 'type'>) {
    const chat = await chatDatabase.createPrivateChatChat(newChat)
    if (!chat) {
      return
    }
    chats.value.unshift(chat)
  }

  return {
    chats,
    createPrivateChatChat,
  }
})
