import type { Identity, IdentityOption } from '@renderer/database/identit'
import type { BaseUserInfo } from '@renderer/database/user'
import type { BufferFile } from '@renderer/utils/ky'
import { usePeerClientMethods } from '@renderer/client/use'
import { identityDatabase } from '@renderer/database/identit'
import { decryptClientID } from '@renderer/utils/id'
import { readBufferFromStore } from '@renderer/utils/ky'
import { logger } from '@renderer/utils/logger'
import once from 'lodash/once'

const max_identity_count = 10

export type ExchangeUser = Omit<BaseUserInfo, 'avatar'> & { avatar: BufferFile }

export const useIdentity = defineStore('identity', () => {
  const currentIdentityId = useStorage<Identity['id']>('current-identity', null)
  const identitys = ref<Identity[]>([])

  const { registerHandler, connect, invoke, hasServerConnection } = usePeerClientMethods()

  async function init() {
    identitys.value = await identityDatabase.getIdentitys()
  }

  once(init)()

  function canCreateIdentity() {
    return identitys.value.length < max_identity_count
  }

  function createIdentity(identity: IdentityOption) {
    if (identitys.value.length >= max_identity_count) {
      throw new Error('The number of identities exceeds the maximum limit')
    }
    return identityDatabase.addIdentity(identity)
  }

  function setCurrentIdentity(identity: Identity) {
    currentIdentityId.value = identity.id
  }

  const currentIdentity = computed(() => {
    return identitys.value.find(identity => identity.id === currentIdentityId.value)
  })

  registerHandler('request:identity', async (): Promise<ExchangeUser> => {
    logger.log('request:identity')
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }
    return {
      name: currentIdentity.value.name,
      email: currentIdentity.value.email,
      id: currentIdentity.value.id,
      avatar: await readBufferFromStore(currentIdentity.value.avatar),
    }
  })

  async function searchFriend(id: string) {
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }

    const _id = await decryptClientID(id)

    if (!_id || await hasServerConnection(_id)) {
      return undefined
    }

    const conn = await connect(_id, {
      id: await window.system.getID(),
      info: {
        name: currentIdentity.value.name,
        avatar: await readBufferFromStore(currentIdentity.value.avatar),
        email: currentIdentity.value.email,
        id: currentIdentity.value.id,
      },
    })

    return await invoke<ExchangeUser>(conn, 'request:identity').catch((err) => {
      logger.error('request:identity', err)
    })
  }

  return {
    currentIdentityId,
    currentIdentity,
    identitys,

    createIdentity,
    canCreateIdentity,
    setCurrentIdentity,
    reset: init,
    searchFriend,
  }
})
