import { shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { get, set } from './libs/store'
import { logger } from './libs/logger'

let mainWindow: BrowserWindow | null = null

export function createWindow() {
  logger.info('Main window is creating.')
  const { width, height } = get('window')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width ?? 900,
    height: height ?? 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      partition: 'persist:main'
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow?.getSize() ?? [900, 670]
    set('window', { width, height })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function getMainWindow() {
  if (mainWindow) {
    return mainWindow
  }

  throw new Error('Main window is not created yet.')
}
