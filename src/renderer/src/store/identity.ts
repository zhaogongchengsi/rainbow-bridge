import type { Identity, IdentityOption } from '@renderer/database/identit'
import { usePeerClientMethods } from '@renderer/client/use'
import { identityDatabase } from '@renderer/database/identit'
import { decryptClientID, getClientUniqueId } from '@renderer/utils/id'
import { readBufferFromStore } from '@renderer/utils/ky'
import { isEmpty } from 'lodash'
import once from 'lodash/once'

const max_identity_count = 10

export const useIdentity = defineStore('identity', () => {
  const currentIdentityId = useStorage<Identity['id']>('current-identity', null)
  const identitys = ref<Identity[]>([])

  const { setMetadata, invokeIdentity, hasServerConnection } = usePeerClientMethods()

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

  watch(currentIdentity, async () => {
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }
    setMetadata({
      id: await getClientUniqueId(),
      info: {
        name: currentIdentity.value.name,
        avatar: await readBufferFromStore(currentIdentity.value.avatar),
        email: currentIdentity.value.email,
        id: await getClientUniqueId(),
        connectID: await getClientUniqueId(),
      },
    })
  })

  async function searchFriend(id: string) {
    if (!currentIdentity.value) {
      throw new Error('Current identity not found')
    }

    const _id = await decryptClientID(id)

    if (!_id || !await hasServerConnection(_id)) {
      return undefined
    }

    return await invokeIdentity(_id)
  }

  function getCurrentIdentity() {
    if (!currentIdentityId.value || isEmpty(identitys.value)) {
      throw new Error('Current identity not found')
    }
    const current = identitys.value.find(identity => identity.id === currentIdentityId.value)
    if (!current) {
      throw new Error('Current identity not found')
    }

    return current
  }

  return {
    currentIdentityId,
    currentIdentity,
    identitys,

    createIdentity,
    canCreateIdentity,
    setCurrentIdentity,
    getCurrentIdentity,
    reset: init,
    searchFriend,
  }
})
