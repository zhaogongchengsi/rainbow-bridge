import type { IpcRendererEvent } from 'electron'
import { off, on, once, send } from '@renderer/utils/ipc'
import { logger } from '@renderer/utils/logger'

const handlerKey = Symbol('app-global-handler')

export type WebAppHandle = (...args: any[]) => any | Promise<any>

export interface useDefineHandleConfig {
  needEvent?: boolean
  once?: boolean
  handler: WebAppHandle
}

export interface WebHandleConfig {
  id: string
  args: any[]
  method: string
}

export function createGlobalHandle() {
  const handlers = new Map<string, useDefineHandleConfig>()

  logger.info('[handle] create global handle')

  provide(handlerKey, {
    defineHandle: (name: string, handle: useDefineHandleConfig) => {
      logger.silly(`[handle] define ${name}`)
      handlers.set(name, handle)
    },
    removeHandle: (name: string) => {
      logger.silly(`[handle] remove ${name}`)
      handlers.delete(name)
    },
  })

  async function onCallHandle(e: IpcRendererEvent, c: WebHandleConfig) {
    const { id, args, method } = c
    const handle = handlers.get(method)
    if (!handle) {
      console.error(`[handle] ${method} not found`)
      send('handle-response', { id, result: null, error: `[handle] ${method} not found` })
    }
    else {
      try {
        const result = await Promise.resolve(
          handle.needEvent ? handle.handler(e, ...args) : handle.handler(...args),
        )
        send('handle-response', { id, result, error: null })
      }
      catch (e: any) {
        send('handle-response', { id, result: null, error: e.message })
      }
      finally {
        if (handle.once) {
          handlers.delete(method)
        }
      }
    }
  }

  on('call-handle', onCallHandle)

  onUnmounted(() => {
    handlers.clear()
    off('call-handle', onCallHandle)
  })
}

export function useDefineHandle(
  name: string,
  handler: WebAppHandle,
  config: {
    needEvent?: boolean
    once?: boolean
  } = {},
) {
  const handlerConfigInjecting = inject<{
    defineHandle: (name: string, handle: useDefineHandleConfig) => void
    removeHandle: (name: string) => void
  }>(handlerKey)

  config = Object.assign({ needEvent: false, once: false }, config)

  handlerConfigInjecting?.defineHandle(name, {
    ...config,
    handler,
  })

  onUnmounted(() => {
    handlerConfigInjecting?.removeHandle(name)
  })
}

export function useRendererEvent(name: string, handler: WebAppHandle, isOnce: boolean = false) {
  if (isOnce) {
    once(name, (_: IpcRendererEvent, ...args: any[]) => {
      handler(...args)
    })
    return
  }
  on(name, (e, ...args) => {
    handler(e, ...args)
  })
  onUnmounted(() => {
    off(name, handler)
  })
}
