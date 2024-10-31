import type { Identity } from './types/identit'
import { randomUUID } from 'uncrypto'
import { RainbowBridgeDatabase } from './base'

export type IdentityOption = Omit<Identity, 'id' | 'uuid' | 'create_by'>

class IdentityDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  async addIdentity(identity: IdentityOption) {
    const uuid = randomUUID()
    return this.identitys.add({
      ...identity,
      uuid,
      create_by: Date.now(),
    })
  }

  async getIdentitys() {
    // Sort by create time
    return (await this.identitys.toArray()).sort((a, b) => b.create_by - a.create_by)
  }
}

export const identityDatabase = new IdentityDatabase()
