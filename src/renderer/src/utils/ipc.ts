const electron = window.electron.ipcRenderer

export function send(channel: string, ...args: unknown[]) {
  electron.send(channel, ...args)
}

export function on(channel: string, listener: (...args: unknown[]) => void) {
  electron.on(channel, listener)
}

export function invoke(channel: string, ...args: unknown[]) {
  return electron.invoke(channel, ...args)
}

export function once(channel: string, listener: (...args: unknown[]) => void) {
  electron.once(channel, listener)
}
