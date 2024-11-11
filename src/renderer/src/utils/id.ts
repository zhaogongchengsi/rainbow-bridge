import { SALT } from '@renderer/constants'
import { decryptString, encryptString } from './decrypt'

export async function getClientID() {
  const id = await window.system.getID()

  return encryptString(id, SALT)
}

export function decryptClientID(id: string) {
  return decryptString(id, SALT)
}
