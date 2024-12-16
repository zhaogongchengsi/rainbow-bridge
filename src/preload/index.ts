/* eslint-disable node/prefer-global/process */
/* eslint-disable ts/ban-ts-comment */
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge } from 'electron'
import { isLinux, isMacOS, isWindows } from 'std-env'

const is = {
  isMacOS,
  isLinux,
  isWindows,
}

const system = {
  setTheme: (theme: 'light' | 'dark' | 'system'): Promise<void> =>
    electronAPI.ipcRenderer.invoke('setTheme', theme),
  getTheme: (): Promise<'light' | 'dark' | 'system'> => electronAPI.ipcRenderer.invoke('getTheme'),
  getID: (): Promise<string> => electronAPI.ipcRenderer.invoke('getId'),
  showDirectoryPicker: (): Promise<string | null> => electronAPI.ipcRenderer.invoke('showDirectoryPicker'),
  scanDirectory: (directory: string, pattern: string = '**/*'): Promise<string[]> => electronAPI.ipcRenderer.invoke('scanDirectory', directory, pattern),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('is', is)
    contextBridge.exposeInMainWorld('system', system)
  }
  catch (error) {
    console.error(error)
  }
}
else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.is = is
  // @ts-ignore (define in dts)
  window.system = system
}
