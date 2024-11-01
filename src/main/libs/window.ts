import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, ipcMain } from 'electron'
import { logger } from './logger'

export interface WebHandleResponse {
  id: string
  result: any
  error: any
}

export class AppWindow extends BrowserWindow {
  methodMap: Map<string, PromiseWithResolvers<any>> = new Map()

  constructor(options: BrowserWindowConstructorOptions) {
    super(options)
    ipcMain.on('handle-response', (_, res) => this.onHandleResponse(res))
    ipcMain.handle('app:exit', async () => {
      logger.info('App is exiting.')
      await this.closeWindow()
      app.quit()
    })
  }

  closeWindow() {
    const { promise, resolve } = Promise.withResolvers<void>()
    this.once('closed', () => {
      resolve()
    })
    this.close()
    return promise
  }

  onHandleResponse(response: WebHandleResponse) {
    const { id, result, error } = response
    const promiser = this.methodMap.get(id)

    if (promiser) {
      promiser.promise.finally(() => {
        this.methodMap.delete(id)
      })
      if (error) {
        promiser.reject(new Error(error))
      }
      else {
        promiser.resolve(result)
      }
    }
  }

  randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charsLength = chars.length
    let result = ''

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * charsLength))
    }

    return result
  }

  /**
   * 调用渲染进程方法
   * @param method
   * @param args
   */
  invoke<T>(method: string, ...args: any[]) {
    const id = this.randomString(10)
    const promiser = Promise.withResolvers<T>()
    this.methodMap.set(id, promiser)
    this.webContents.send('call-handle', { id, method, args })
    return promiser.promise
  }
}
