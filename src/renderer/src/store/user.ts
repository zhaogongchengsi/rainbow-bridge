import type { ExchangeUser, User } from '@renderer/database/user'
import { usePeerClientMethods } from '@renderer/client/use'
import { userDatabase } from '@renderer/database/user'
import once from 'lodash/once'

export const useUser = defineStore('app-user', () => {
  const users = ref<User[]>([])

  const { invokeIdentity } = usePeerClientMethods()
  async function init() {
    users.value = await userDatabase.getUsers()
  }

  once(init)()

  async function upsertUser(newUser: ExchangeUser) {
    const user = await userDatabase.upsertUser(newUser)
    if (!user) {
      return
    }

    const index = users.value.findIndex(u => u.id === user.id)

    if (index !== -1) {
      users.value = users.value.toSpliced(index, 1, user)
    }
    else {
      users.value.push(user)
    }

    return user
  }

  async function requestAndCreateNewUser(id: string) {
    let hasUser = await userDatabase.getUserById(id)
    if (!hasUser) {
      const newUser = await invokeIdentity(id)
      hasUser = newUser && await upsertUser(newUser)
    }
    return hasUser
  }

  return {
    users,
    upsertUser,
    requestAndCreateNewUser,
  }
})
