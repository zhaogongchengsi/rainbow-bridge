import { dialog } from 'electron'
import { glob } from 'glob'
import { normalize } from 'pathe'
import { defineHandle } from '../libs/define'

export const showDirectoryPicker = defineHandle(async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  })
  if (result.canceled) {
    return null
  }
  else {
    return result.filePaths[0]
  }
})

export const scanDirectory = defineHandle(async (directory: string, pattern: string = '**/*') => {
  const dirs = await glob(pattern, { cwd: directory, absolute: true })
  return dirs.map(dir => normalize(dir))
})
