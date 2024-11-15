import { SALT } from '@renderer/constants'
import { decryptString, encryptString } from './decrypt'

export async function getClientID() {
  const id = await window.system.getID()

  return encryptString(id, SALT)
}

export async function decryptClientID(id: string) {
  try {
    return await decryptString(id, SALT)
  }
  catch (e: any) {
    console.error(e)
    return undefined
  }
}
