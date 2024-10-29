import { defineHandle } from '../libs/define'
import { copyFileToStore as copyFile } from '../libs/store'

export const copyFileToStore = defineHandle(async (filePath: string): Promise<string> => {
  return await copyFile(filePath)
})
