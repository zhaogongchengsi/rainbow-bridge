import type { ID } from './type'

export interface FolderSpace {
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
