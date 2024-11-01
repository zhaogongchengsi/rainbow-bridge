// const electron = window.electron.ipcRenderer

export function send(channel: string, ...args: any[]) {
  window.electron.ipcRenderer.send(channel, ...args)
}

export function on(channel: string, listener: (...args: any[]) => void) {
  window.electron.ipcRenderer.on(channel, listener)
}

export function invoke(channel: string, ...args: any[]) {
  return window.electron.ipcRenderer.invoke(channel, ...args)
}

export function once(channel: string, listener: (...args: any[]) => void) {
  window.electron.ipcRenderer.once(channel, listener)
}

export function off(channel: string, listener: (...args: any[]) => void) {
  window.electron.ipcRenderer.removeListener(channel, listener)
}
