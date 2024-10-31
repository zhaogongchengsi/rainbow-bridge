import { identityDatabase, IdentityOption } from '@renderer/database/identit'
import { Identity } from '@renderer/database/types/identit'
import once from 'lodash/once'

const max_identity_count = 10

export const useIdentity = defineStore('identity', () => {
  const currentIdentity = useStorage<Identity | null>('current-identity', null)
  const identitys = ref<Identity[]>([])

  async function init() {
    identitys.value = await identityDatabase.getIdentitys()
  }

  onMounted(once(init))

  function canCreateIdentity() {
    return identitys.value.length < max_identity_count
  }

  function createIdentity(identity: IdentityOption) {
    if (identitys.value.length >= max_identity_count) {
      throw new Error('The number of identities exceeds the maximum limit')
    }
    return identityDatabase.addIdentity(identity)
  }

  return {
    currentIdentity,
    identitys,

    createIdentity,
    canCreateIdentity,
    reset: init
  }
})
