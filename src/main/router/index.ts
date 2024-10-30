import { AppRouter } from '../libs/router'
import { uploadFileToStore } from './store'

export function registerRouter(router: AppRouter) {
  router.post('/store/file/upload', uploadFileToStore)
}
