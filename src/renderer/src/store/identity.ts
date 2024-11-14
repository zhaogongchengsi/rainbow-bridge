import type { Identity, IdentityOption } from '@renderer/database/identit'
import { usePeerClientMethods } from '@renderer/client/use'
import { SALT } from '@renderer/constants'
import { identityDatabase } from '@renderer/database/identit'
import { withTimeout } from '@renderer/utils/async'
import { decryptString } from '@renderer/utils/decrypt'
import { readBufferFromStore } from '@renderer/utils/ky'
import { logger } from '@renderer/utils/logger'
import once from 'lodash/once'

const max_identity_count = 10

export const useIdentity = defineStore('identity', () => {
  const currentIdentityId = useStorage<Identity['uuid']>('current-identity', null)
  const identitys = ref<Identity[]>([])

  const { registerHandler, connect, invoke } = usePeerClientMethods()

  async function init() {
    identitys.value = await identityDatabase.getIdentitys()
  }

  once(init)

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
    currentIdentityId.value = identity.uuid
  }

  const currentIdentity = computed(() => {
    return identitys.value.find(identity => identity.uuid === currentIdentityId.value)
  })

  registerHandler('request:identity', async () => {
    logger.log('request:identity')
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }
    return {
      ...currentIdentity.value,
      avatar: await readBufferFromStore(currentIdentity.value.avatar),
    }
  })

  async function searchFriend(id: string) {
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }

    const conn = await connect(await decryptString(id, SALT), {
      id: await window.system.getID(),
      info: {
        name: currentIdentity.value.name,
        avatar: await readBufferFromStore(currentIdentity.value.avatar),
        email: currentIdentity.value.email,
        uuid: currentIdentity.value.uuid,
      },
    })

    const data = await withTimeout(invoke(conn, 'request:identity'))

    console.log(data)
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
