import { app } from 'electron'
import { Low } from 'lowdb/lib'
import { JSONFilePreset } from 'lowdb/node'
import { logger } from './logger'
import { FILE_STORE_NAME } from './constant'
import { ensureDir } from 'fs-extra'
import { join } from 'pathe'
export interface Store {
  window: {
    width: number
    height: number
  }
  theme: 'light' | 'dark' | 'system'
}

const defaultData: Store = {
  window: {
    width: 900,
    height: 670
  },
  theme: 'system'
}

let db: Low<Store> | null = null
let fileStorePath: string | null = null

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
  return getStore().write()
}

export function get<K extends keyof Store>(key: K): Store[K] {
  return getStore().data[key]
}

export function set<K extends keyof Store>(key: K, value: Store[K]) {
  getStore().data[key] = value
  return saveStore()
}

export async function initFileStore() {
  fileStorePath = join(app.getPath('home'), FILE_STORE_NAME)
  return await ensureDir(fileStorePath)
}

export function getFileStorePath() {
  if (!fileStorePath) {
    throw new Error('File store is not initialized.')
  }
  return fileStorePath
}
