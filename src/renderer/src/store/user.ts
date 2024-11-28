import type { ID } from '@renderer/database/type'
import type { SelfUser, User } from '@renderer/database/user'
import { usePeerClientMethods } from '@renderer/client/use'
import { userDatabase } from '@renderer/database/user'
import { decryptClientID, getClientUniqueId } from '@renderer/utils/id'
import once from 'lodash/once'

export const useUser = defineStore('app-user', () => {
  const users = ref<User[]>([])
  const currentUserId = useStorage<string>('current-identity', null)

  const { setMetadata, invokeIdentity, hasServerConnection, on } = usePeerClientMethods()

  const router = useRouter()

  async function init() {
    users.value = await userDatabase.getUsers()
  }

  const selfUsers = computed((): User[] => {
    return users.value.filter(use => use.isMe)
  })

  const currentUser = computed((): User | undefined => {
    return users.value.find(user => user.id === currentUserId.value && user.isMe)
  })

  watch(currentUser, async () => {
    if (!currentUser.value) {
      return
    }
    const id = await getClientUniqueId()
    setMetadata({
      id,
      info: currentUser.value,
    })
  })

  async function upsertUser(newUser: SelfUser) {
    const user = await userDatabase.upsertUser({
      id: newUser.id,
      name: newUser.name,
      avatar: newUser.avatar,
      connectID: newUser.connectID,
    })
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

  async function createSelf(info: Omit<SelfUser, 'id' | 'connectID'>) {
    await userDatabase.createMe(info)
    await init()
  }

  function setCurrentUser(id: ID) {
    currentUserId.value = id
  }

  function getCurrentUser() {
    if (!currentUser.value) {
      router.push('/')
      throw new Error('Current identity not found')
    }

    return currentUser.value
  }

  async function requestAndCreateNewUser(id: ID) {
    let hasUser = await userDatabase.getUserById(id)
    if (!hasUser) {
      const newUser = await invokeIdentity(id)
      hasUser = newUser && await upsertUser(newUser)
    }
    return hasUser
  }

  async function searchFriend(id: string) {
    if (!currentUser.value) {
      throw new Error('Current identity not found')
    }

    const _id = await decryptClientID(id)

    if (!_id || !await hasServerConnection(_id)) {
      return undefined
    }

    return await invokeIdentity(_id)
  }

  on('peer:connection', async ([metadata]) => {
    const newUser = metadata.info
    await upsertUser(newUser)
  })

  return {
    users,
    upsertUser,
    requestAndCreateNewUser,
    searchFriend,
    currentUser,
    setCurrentUser,
    getCurrentUser,
    createSelf,
    selfUsers,
    init: once(init),
  }
})
