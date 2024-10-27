import { RainbowBridgeDatabase, Identity } from './base'

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
