import type { User } from '@renderer/database/user'
import { userDatabase } from '@renderer/database/user'
import once from 'lodash/once'

export const useUser = defineStore('app-user', () => {
  const users = ref<User[]>([])

  async function init() {
    users.value = await userDatabase.getUsers()
  }

  once(init)()

  async function createUser(newChat: Omit<ChatOption, 'type'>) {
    const chat = await chatDatabase.createPrivateChatChat(newChat)
    if (!chat) {
      return
    }
    users.value.unshift(chat)
  }

  return {
    users,
    createUser,
  }
})
