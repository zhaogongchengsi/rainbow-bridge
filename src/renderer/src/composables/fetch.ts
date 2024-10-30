import { createFetch } from '@vueuse/core'

export const useAppFetch = createFetch({
  baseUrl: 'rainbow://app/'
})
