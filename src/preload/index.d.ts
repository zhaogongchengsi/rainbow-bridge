import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    is: {
      isMacOS: boolean
      isLinux: boolean
      isWindows: boolean
    }
    system: {
      setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>
      getTheme: () => Promise<'light' | 'dark' | 'system'>
      getID: () => Promise<string>
    }
  }
}
