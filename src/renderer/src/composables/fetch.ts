import { BASE_URL } from '@renderer/constants'
import { createFetch } from '@vueuse/core'

export const useAppFetch = createFetch({
  baseUrl: BASE_URL,
})
