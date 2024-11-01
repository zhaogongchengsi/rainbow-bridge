import type { AppRouter } from './libs/router'
import { join } from 'node:path'
import process from 'node:process'
import { is } from '@electron-toolkit/utils'
import { shell } from 'electron'
import icon from '../../resources/icon.png?asset'
import { logger } from './libs/logger'
import { get, set } from './libs/store'
import { AppWindow } from './libs/window'

let mainWindow: AppWindow | null = null

export function createWindow(router?: AppRouter) {
  logger.info('Main window is creating.')
  const { width, height } = get('window')
  const theme = get('theme')
  mainWindow = new AppWindow({
    width: width ?? 900,
    height: height ?? 670,
    minWidth: 500,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    backgroundColor: theme === 'dark' ? '#000' : '#fff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      partition: 'persist:main',
      zoomFactor: 1,
      webSecurity: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow?.getSize() ?? [900, 670]
    set('window', { width, height })
  })

  if (router) {
    router.listen(mainWindow)
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/welcome`)
  }
  else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html/#/welcome'))
  }

  return mainWindow
}

export function getMainWindow() {
  if (mainWindow) {
    return mainWindow
  }

  throw new Error('Main window is not created yet.')
}
