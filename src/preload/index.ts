import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { isMacOS, isLinux, isWindows } from 'std-env'

const is = {
  isMacOS,
  isLinux,
  isWindows
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('is', is)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.is = is
}
