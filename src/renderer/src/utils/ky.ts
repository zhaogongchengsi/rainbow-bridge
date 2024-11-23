import { BASE_URL } from '@renderer/constants'
import ky from 'ky'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'
import { isAbsolute, parse } from 'pathe'

export interface BufferFile {
  buffer: ArrayBuffer
  name: string
  type: string
  size: number
}

export function isBufferFile(file: any): file is BufferFile {
  return 'buffer' in file && 'name' in file && 'type' in file && 'size' in file
}

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

export async function uploadBufferToStore(buffer: BufferFile) {
  const data = new FormData()
  data.append(buffer.name, new Blob([buffer.buffer], { type: buffer.type }), buffer.name)
  const [filePath] = await http.post<string[]>('store/file/upload', { body: data }).json()
  return filePath
}

export async function uploadAvatar(file: File) {
  const [avatar] = await uploadFilesToStore([file])
  return avatar
}

export function resolveFilePath(file: string) {
  return isAbsolute(file) && file.startsWith('file:') ? file : `file://${file}`
}

const fileCache = new Map<string, Blob>()

export async function downloadFileFromStore(file: string) {
  if (fileCache.has(file)) {
    return fileCache.get(file)!
  }
  const buffer = await (await window.fetch(resolveFilePath(file))).blob()
  fileCache.set(file, buffer)
  return buffer
}

export async function readBufferFromStore(file: string): Promise<BufferFile> {
  const blob = await downloadFileFromStore(file)
  return {
    buffer: await blob.arrayBuffer(),
    name: parse(file).base,
    type: blob.type,
    size: blob.size,
  }
}

const urlCache = new Map<string, string>()

export function bufferToUrl(buffer: BufferFile): string {
  const cacheKey = `${buffer.name}-${buffer.size}-${buffer.type}`
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!
  }
  const url = URL.createObjectURL(new Blob([buffer.buffer], { type: buffer.type }))
  urlCache.set(cacheKey, url)
  return url
}
