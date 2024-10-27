import { defineEventHandle } from '../libs/define'

export const onPong = defineEventHandle(async () => {
  return 'ping'
})
