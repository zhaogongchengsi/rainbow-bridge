import type { ID } from './type'
import { RainbowBridgeDatabase } from './base'

export interface FolderSpace {
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

export class Folder extends RainbowBridgeDatabase {
  constructor() {
    super()
  }
}
