import type { BrowserWindow } from 'electron'
import type { RadixRouter } from 'radix3'
import { createRouter } from 'radix3'
import { logger } from './logger'

export type AppRouterHandler = (req: AppRouterContext) => any | Promise<any>
export type AppRouterMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'

export interface AppRouterConfig {
  handle: AppRouterHandler
  method?: AppRouterMethod
}

export class AppRouter {
  router: RadixRouter<AppRouterConfig>
  scheme: string
  host: string
  constructor(scheme: string, host: string) {
    this.scheme = scheme
    this.host = host
    this.router = createRouter()
  }

  private addRoute(path: string, method: AppRouterMethod, handler: AppRouterHandler) {
    this.router.insert(path, { method, handle: handler })
  }

  get(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'GET', handler)
  }

  post(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'POST', handler)
  }

  put(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'PUT', handler)
  }

  delete(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'DELETE', handler)
  }

  patch(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'PATCH', handler)
  }

  options(path: string, handler: AppRouterHandler) {
    this.addRoute(path, 'OPTIONS', handler)
  }

  listen(window: BrowserWindow) {
    const scheme = this.scheme
    window.webContents.session.protocol.handle(scheme, async (request: Request) => {
      const { host, pathname } = new URL(request.url)
      if (host !== this.host) {
        return new Response('Not Found', { status: 404 })
      }
      const handler = this.router.lookup(pathname)
      if (!handler) {
        return new Response('Not Found', { status: 404 })
      }
      if (handler && handler.method !== request.method) {
        return new Response('Method Not Allowed', { status: 405 })
      }
      const ctx = new AppRouterContext(request, window, handler ? handler.params : undefined)
      try {
        await Promise.resolve(handler.handle(ctx))
        return ctx.readRequest()
      }
      catch {
        return new Response('Internal Server Error', { status: 500 })
      }
    })
  }
}

export class AppRouterContext {
  req: Request
  params?: Record<string, any>
  window: BrowserWindow | null = null
  response: Response | null = null
  constructor(req: Request, window: BrowserWindow, params?: Record<string, any> | undefined) {
    this.req = req
    this.params = params
    this.window = window
  }

  sendJson(data: any) {
    this.response = new Response(JSON.stringify(data), {
      status: 200,
      statusText: 'OK',
    })
  }

  readRequest() {
    if (!this.response) {
      logger.warn('No response has been sent')
      return new Response(null, {
        status: 204,
        statusText: 'No Content',
      })
    }
    return this.response
  }

  sendImage(imageBuffer: ArrayBuffer, contentType: string) {
    this.response = new Response(imageBuffer, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': contentType,
      },
    })
  }

  sendError(message: string, status: number) {
    this.response = new Response(JSON.stringify({ error: message }), {
      status,
      statusText: 'Error',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  readFromData() {
    return this.req.formData()
  }
}
