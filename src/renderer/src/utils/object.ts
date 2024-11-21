import isArray from 'lodash/isArray'
import isObject from 'lodash/isObject'

export type Predicate = (value: any) => boolean

export function findKeysByPredicate(obj: any, predicate: Predicate): string[] {
  const result: string[] = []

  function traverse(currentObj: any, path: string[] = []) {
    if (isArray(currentObj)) {
      currentObj.forEach((item, index) => {
        // TODO: [`...path, '${index.toString()}'`]
        const currentPath = [...path, index.toString()]
        if (predicate(item)) {
          result.push(currentPath.join('.'))
        }
        if (isObject(item) && item !== null) {
          traverse(item, currentPath)
        }
      })
    }
    else {
      for (const key in currentObj) {
        if (Object.hasOwnProperty.call(currentObj, key)) {
          const value = currentObj[key]
          const currentPath = [...path, key]

          if (predicate(value)) {
            result.push(currentPath.join('.'))
          }

          if (isObject(value) && value !== null) {
            traverse(value, currentPath)
          }
        }
      }
    }
  }

  traverse(obj)
  return result
}
