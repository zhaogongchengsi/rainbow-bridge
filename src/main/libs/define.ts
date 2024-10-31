export type ElectronHandle<T> = (...args: any[]) => T | Promise<T>

export interface HandleConfig {
  useCache?: boolean
  useEvent?: boolean
}

export interface EventConfig {
  once?: boolean
  useEvent?: boolean
}

export interface ElectronHandleConfig<T> {
  handle: ElectronHandle<T>
  config?: HandleConfig
}

export interface ElectronEventConfig<T> {
  handle: ElectronHandle<T>
  config?: EventConfig
}

const defineHandleConfig: HandleConfig = {
  useCache: true,
  useEvent: false,
}

const defineEventConfig: EventConfig = {
  once: false,
  useEvent: false,
}

export function defineHandle<T>(
  handle: ElectronHandle<T>,
  config: Omit<HandleConfig, 'once'> = {},
): ElectronHandleConfig<T> {
  return {
    handle,
    config: {
      ...defineHandleConfig,
      ...config,
    },
  }
}

export function defineOnceHandle<T>(
  handle: ElectronHandle<T>,
  config: Omit<HandleConfig, 'once'> = {},
): ElectronHandleConfig<T> {
  return {
    handle,
    config: {
      ...defineHandleConfig,
      ...config,
    },
  }
}

export function defineEventHandle<T>(
  handle: ElectronHandle<T>,
  config: Omit<HandleConfig, 'once'> = {},
): ElectronEventConfig<T> {
  return {
    handle,
    config: {
      ...defineEventConfig,
      ...config,
    },
  }
}

export function defineOnceEventHandle<T>(
  handle: ElectronHandle<T>,
  config: Omit<HandleConfig, 'once'> = {},
): ElectronEventConfig<T> {
  return {
    handle,
    config: {
      ...defineEventConfig,
      ...config,
      once: true,
    },
  }
}
