import { BASE_URL } from '@renderer/constants'
import ky from 'ky'
import isEmpty from 'lodash/isEmpty'

export const http = ky.create({
  prefixUrl: BASE_URL,
})

export async function uploadFilesToStore(files: FileList | File[]) {
  if (isEmpty(files)) {
    return Promise.resolve([])
  }
  const data = new FormData()
  Array.from(files).forEach((file) => {
    data.append(file.name, file)
  })
  return await http.post<string[]>('store/file/upload', { body: data }).json()
}

export async function uploadAvatar(file: File) {
  const [avatar] = await uploadFilesToStore([file])
  return avatar
}
