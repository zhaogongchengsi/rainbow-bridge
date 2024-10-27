import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './window'
import { initStore } from './libs/store'
import { logger } from './libs/logger'
import { registerHandlers, registerEvents } from './libs/register'

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

const handles = import.meta.glob('./handles/*.ts')
const events = import.meta.glob('./events/*.ts')

app.whenReady().then(async () => {
  logger.silly('App is ready.')

  electronApp.setAppUserModelId('com.electron')

  await initStore()
  await registerHandlers(handles)
  await registerEvents(events)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
