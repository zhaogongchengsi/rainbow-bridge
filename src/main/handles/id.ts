import { machineId } from 'node-machine-id'
import { defineHandle } from '../libs/define'

let id: string | null = null

export const getId = defineHandle(async () => {
  if (!id) {
    id = await machineId()
  }
  return id
})
