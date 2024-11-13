import type { Identity, IdentityOption } from '@renderer/database/identit'
import { identityDatabase } from '@renderer/database/identit'
import once from 'lodash/once'

const max_identity_count = 10

export const useIdentity = defineStore('identity', () => {
  const currentIdentityId = useStorage<Identity['uuid']>('current-identity', null)
  const identitys = ref<Identity[]>([])

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

  return {
    currentIdentityId,
    currentIdentity,
    identitys,

    createIdentity,
    canCreateIdentity,
    setCurrentIdentity,
    reset: init,
  }
})
