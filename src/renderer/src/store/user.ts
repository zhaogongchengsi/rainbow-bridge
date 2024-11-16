import type { ExchangeUser, User } from '@renderer/database/user'
import { userDatabase } from '@renderer/database/user'
import once from 'lodash/once'

export const useUser = defineStore('app-user', () => {
  const users = ref<User[]>([])

  async function init() {
    users.value = await userDatabase.getUsers()
  }

  once(init)()

  async function createUser(newUser: ExchangeUser) {
    const user = await userDatabase.createUser(newUser)
    if (!user) {
      return
    }
    users.value.push(user)
    return user
  }

  return {
    users,
    createUser,
  }
})
