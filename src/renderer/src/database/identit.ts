import { RainbowBridgeDatabase } from './base'
import { Identity } from './types/identit'

class IdentityDatabase extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  async addIdentity(identity: Identity) {
    return this.identitys.add(identity)
  }

  async getIdentitys() {
    return this.identitys.toArray()
  }
}

export const identityDatabase = new IdentityDatabase()
