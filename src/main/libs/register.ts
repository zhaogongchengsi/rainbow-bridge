import { ElectronEventConfig, ElectronHandleConfig } from './define'
import { logger } from './logger'
import { ipcMain } from 'electron'

export async function registerHandlers(handles: Record<string, () => Promise<unknown>>) {
  logger.silly('Registering handlers.')
  for (const [id, modules] of Object.entries(handles)) {
    await baseRegisterHandlers(id, modules)
  }
}

export async function registerEvents(events: Record<string, () => Promise<unknown>>) {
  logger.silly('Registering events.')
  for (const [name, modules] of Object.entries(events)) {
    await baseRegisterEvents(name, modules)
  }
}

async function baseRegisterHandlers(id: string, modules: () => Promise<unknown>) {
  try {
    const module = (await modules()) as Record<string, ElectronHandleConfig<unknown>>
    for (const [name, handlerConfig] of Object.entries(module)) {
      const { handle, config } = handlerConfig
      const needEvent = config?.useEvent ?? false
      ipcMain.handle(name, async (event, ...args) => {
        try {
          logger.silly(`Handling ${id}:${name} with args:`, args)
          return needEvent ? await handle(event, ...args) : await handle(...args)
        } catch (error) {
          logger.error(`Failed to handle ${id}:${name}.`, error)
          throw error
        }
      })
    }
  } catch (error) {
    logger.error(`Failed to register handler ${id}.`, error)
  }
}

async function baseRegisterEvents(id: string, modules: () => Promise<unknown>) {
  try {
    const module = (await modules()) as Record<string, ElectronEventConfig<unknown>>
    for (const [name, handlerConfig] of Object.entries(module)) {
      const { handle, config } = handlerConfig
      const isOnce = config?.once ?? false
      const needEvent = config?.useEvent ?? false

      if (isOnce) {
        ipcMain.once(name, async (event, ...args) => {
          try {
            logger.silly(`Handling ${id}:${name} with args:`, args)
            return needEvent ? await handle(event, ...args) : await handle(...args)
          } catch (error) {
            logger.error(`Failed to handle ${id}:${name}.`, error)
            throw error
          }
        })
        return
      }
      ipcMain.addListener(name, async (event, ...args) => {
        try {
          logger.silly(`Handling ${id}:${name} with args:`, args)
          return needEvent ? await handle(event, ...args) : await handle(...args)
        } catch (error) {
          logger.error(`Failed to handle ${id}:${name}.`, error)
          throw error
        }
      })
    }
  } catch (error) {
    logger.error(`Failed to register event ${id}.`, error)
  }
}
