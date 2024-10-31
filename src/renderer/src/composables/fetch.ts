import { createFetch } from '@vueuse/core'
import ky from 'ky'

const baseUrl = 'rainbow://app/'

export const useAppFetch = createFetch({
  baseUrl
})

const original = ky.create({
  prefixUrl: baseUrl
})

export const useKy = () => original
