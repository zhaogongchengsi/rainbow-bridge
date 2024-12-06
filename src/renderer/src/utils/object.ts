import forOwn from 'lodash/forOwn'
import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'

const windowsRegex = /^[a-z]:[\\/](?:[^\\/:*?"<>|\r\n]+[\\/])*[^\\/:*?"<>|\r\n]*$/i
// eslint-disable-next-line regexp/no-useless-escape, regexp/no-unused-capturing-group
const unixRegex = /^(\/[^\/]+)+\/?$/

export function isFilePath(file: unknown) {
  return isString(file) && [file.startsWith('file://'), windowsRegex.test(file), unixRegex.test(file)].some(Boolean)
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

export function deepMerge(origin: any, target: any): any {
  if (typeof target !== 'object' || target === null) {
    return target
  }

  const result = { ...origin }

  for (const key in target) {
    if (Object.hasOwnProperty.call(target, key)) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        result[key] = deepMerge(origin[key], target[key])
      }
      else {
        result[key] = target[key]
      }
    }
  }

  return result
}
