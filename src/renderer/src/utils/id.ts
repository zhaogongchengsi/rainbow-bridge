import { SALT } from '@renderer/constants'
import { decryptString, encryptString } from './decrypt'

let encryptClientID: string | undefined
let clientID: string | undefined
export async function getClientID() {
  if (encryptClientID) {
    return encryptClientID
  }

  const id = await window.system.getID()

  encryptClientID = await encryptString(id, SALT)

  return encryptClientID
}

export async function getClientUniqueId() {
  if (clientID) {
    return clientID
  }

  clientID = await window.system.getID()

  return clientID
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
