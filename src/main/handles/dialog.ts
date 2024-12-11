import { dialog } from 'electron'
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
