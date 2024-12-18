import type { FolderSpace, FolderSpaceOptions } from '@renderer/database/folder'
import { folderDatabase } from '@renderer/database/folder'

export const useFolder = defineStore('app-folder', () => {
  const folders = reactive<FolderSpace[]>([])
  const currentFolderId = useStorage<string>('current-folder-id', '')

  async function folderInit() {
    const _folders = await folderDatabase.getFolders()
    _folders.forEach(f => folders.push(f))
  }

  const currentFolder = computed(() => {
    return folders.find(folder => folder.id === currentFolderId.value)
  })

  async function createFolder(folder: FolderSpaceOptions) {
    const newFolder = await folderDatabase.addFolder(folder)
    folders.push(newFolder)
  }

  function findFolderById(id: string) {
    return folders.find(f => f.id === id)
  }

  return {
    folders,
    currentFolder,
    folderInit,
    createFolder,
    findFolderById,
  }
})
