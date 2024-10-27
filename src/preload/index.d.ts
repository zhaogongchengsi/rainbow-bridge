import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    is: {
      isMacOS: boolean
      isLinux: boolean
      isWindows: boolean
    }
  }
}
