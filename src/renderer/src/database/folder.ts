import type { ID } from './type'
import { RainbowBridgeDatabase } from './base'

export interface FolderSpace {
  uuid: ID
  id: ID
  /**
   * 同步的目标客户
   */
  user: ID
  /**
   * 同步的根目录
   */
  root: string
  /**
   * 最后一次同步的时间
   */
  lastSyncTime: number
  /**
   * 同步的文件夹大小
   */
  size: number
  /**
   * 忽略同步的文件
   */
  ignore: string[]
}

export type FolderSpaceOptions = Omit<FolderSpace, 'uuid' | 'lastSyncTime' | 'size' | 'ignore'>

export class Folder extends RainbowBridgeDatabase {
  constructor() {
    super()
  }

  getFolders(): Promise<FolderSpace[]> {
    return this.folders.toArray()
  }

  async addFolder(folder: FolderSpaceOptions): Promise<FolderSpace> {
    const id = this.folders.add({
      ...folder,
      uuid: this.createUUID(),
      lastSyncTime: Date.now(),
      size: 0,
      ignore: [],
    })
    return (await this.folders.get(id))!
  }
}

export const folderDatabase = new Folder()
