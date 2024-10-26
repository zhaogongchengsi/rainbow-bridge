import { app } from 'electron'
import { Low } from 'lowdb/lib'
import { JSONFilePreset } from 'lowdb/node'
import { join } from 'path'
import { logger } from './logger'

export interface Store {
  window: {
    width: number
    height: number
  }
}

// Read or create db.json
const defaultData: Store = {
  window: {
    width: 900,
    height: 670
  }
}

let db: Low<Store> | null = null

export async function initStore() {
  logger.info('Store is initializing.')
  db = await JSONFilePreset(
    join(app.getPath('userData'), 'rainbow-bridge-config.json'),
    defaultData
  )
}

export function getStore() {
  if (!db) {
    throw new Error('Store is not initialized.')
  }
  return db
}

export function saveStore() {
  if (!db) {
    throw new Error('Store is not initialized.')
  }
  return db.write()
}

export function get(key: keyof Store) {
  if (!db) {
    throw new Error('Store is not initialized.')
  }
  return db.data[key]
}

export function set(key: keyof Store, value: Store[keyof Store]) {
  if (!db) {
    throw new Error('Store is not initialized.')
  }
  db.data[key] = value
  return saveStore()
}
