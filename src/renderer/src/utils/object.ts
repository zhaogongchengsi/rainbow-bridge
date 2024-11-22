import forOwn from 'lodash/forOwn'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'

export function isFilePath(file: string) {
  return isString(file) && file.startsWith('file://')
}

export function findFileKeys(obj: any): string[] {
  const fileKeys = new Set<string>()

  const traverse = (obj: any) => {
    const keys: string[] = []
    forOwn(obj, (value) => {
      if (!value)
        return
      if (isObject(value)) {
        keys.push(...traverse(value))
      }
      else if (isArray(value)) {
        value.forEach((v) => {
          keys.push(...traverse(v))
        })
      }
      if (isFilePath(value)) {
        keys.push(value)
      }
    })
    return keys
  }

  if (isArray(obj)) {
    obj.forEach((value) => {
      traverse(value).forEach(f => fileKeys.add(f))
    })
  }

  if (isObject(obj)) {
    traverse(obj).forEach(f => fileKeys.add(f))
  }

  return Array.from(fileKeys)
}
