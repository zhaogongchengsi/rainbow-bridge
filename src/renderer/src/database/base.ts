import Dexie from 'dexie'
import flatMap from 'lodash/flatMap'
import union from 'lodash/union'
import { randomUUID } from 'uncrypto'

export class RainbowBridgeDatabase extends Dexie {
  constructor() {
    super('rainbow-bridge-db')
  }

  createUUID() {
    return randomUUID()
  }

  generateDexieStoreString(searchableKeys: string[], notSearchableKeys: string[] = []): string {
    const isPrimaryKey = (key: string) => key.startsWith('++') ? key.replace('++', '') : key

    const combinations = flatMap(searchableKeys, (key, index) => {
      return searchableKeys.slice(index + 1).map((otherKey) => {
        return `[${isPrimaryKey(key)}+${otherKey}]`
      })
    })

    const searchKeys = searchableKeys.map(key => `[${isPrimaryKey(key)}]`)

    return union([...searchableKeys, ...notSearchableKeys, ...searchKeys, ...combinations]).join(', ')
  }
}
