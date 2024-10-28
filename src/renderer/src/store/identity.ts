import { identityDatabase } from '@renderer/database/identit'
import { Identity } from '@renderer/database/types/identit'
import once from 'lodash/once'

const max_identity_count = 10

export const useIdentity = defineStore('identity', () => {
  const currentIdentity = useStorage<Identity | null>('current-identity', null)
  const identitys = ref<Identity[]>([])

  onMounted(
    once(async () => {
      identitys.value = await identityDatabase.getIdentitys()
    })
  )

  return {
    currentIdentity,
    identitys
  }
})
