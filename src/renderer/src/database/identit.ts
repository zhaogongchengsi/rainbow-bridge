import { RainbowBridgeDatabase } from './base'
import { Identity } from './types/identit'
import { randomUUID } from 'uncrypto'

export type IdentityOption = Omit<Identity, 'id' | 'uuid'>

class IdentityDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  async addIdentity(identity: IdentityOption) {
    const uuid = randomUUID()
    return this.identitys.add({
      ...identity,
      uuid
    })
  }

  async getIdentitys() {
    return await this.identitys.toArray()
  }
}

export const identityDatabase = new IdentityDatabase()
