export const APP_PEER_PROVIDER_STATE = Symbol('APP_PEER_PROVIDER_STATE')
export const APP_PEER_PROVIDER_METHODS = Symbol('APP_PEER_PROVIDER_METHODS')
export const peer_options = {
  port: Number(import.meta.env.RENDERER_VITE_PEER_PORT),
  path: import.meta.env.RENDERER_VITE_PEER_PATH,
  key: import.meta.env.RENDERER_VITE_PEER_KEY,
  host: import.meta.env.RENDERER_VITE_PEER_URL,
}

export const server_base_url = `http://${peer_options.host}:${peer_options.port}${peer_options.path}/${peer_options.key}`
