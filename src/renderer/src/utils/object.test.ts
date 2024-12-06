import { describe, expect, it } from 'vitest'
import { deepMerge, findFileKeys, isFilePath } from './object'

describe('object', () => {
  it('path to all file protocols should be found', async () => {
    const obj = {
      a: 'file://1x/xx',
      b: 'file://2x/xx',
      c: ['file://3x/xx', 'file://x12/xx'],
      d: ['file://4x/xx', 'file://x11/xx'],
      e: {
        a: 'file://5x/xx',
        b: 'file://6x/xx',
        c: ['file://7x/xx', 'file://10x/xx'],
        d: ['file://8x/xx', 'file://9x/xx'],
      },
    }
    const result = findFileKeys(obj)
    expect(result.length).toBe(12)
  })

  it('should correctly identify file paths', () => {
    expect(isFilePath('file://path/to/file')).toBe(true)
    expect(isFilePath('C:/asdasd/asdasd/.rainbow-bridge/files/wallhaven-jxzq2m.png')).toBe(true)
    expect(isFilePath('C:\\path\\to\\file')).toBe(true)
    expect(isFilePath('/path/to/file')).toBe(true)
    expect(isFilePath('not/a/file/path')).toBe(false)
    expect(isFilePath('')).toBe(false)
    expect(isFilePath(null)).toBe(false)
    expect(isFilePath(undefined)).toBe(false)
  })

  it('should deeply merge two objects', () => {
    const origin = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
      e: 4,
    }
    const target = {
      b: {
        c: 5,
        f: 6,
      },
      e: null,
      g: 7,
    }
    const result = deepMerge(origin, target)
    expect(result).toEqual({
      a: 1,
      b: {
        c: 5,
        d: 3,
        f: 6,
      },
      e: null,
      g: 7,
    })
  })

  it('should return target if target is not an object', () => {
    const origin = { a: 1, b: 2 }
    const target = 3
    const result = deepMerge(origin, target)
    expect(result).toBe(3)
  })

  it('should handle null values in target', () => {
    const origin = { a: 1, b: { c: 2 } }
    const target = { b: null }
    const result = deepMerge(origin, target)
    expect(result).toEqual({ a: 1, b: null })
  })

  it('should handle undefined values in target', () => {
    const origin = { a: 1, b: { c: 2 } }
    const target = { b: undefined }
    const result = deepMerge(origin, target)
    expect(result).toEqual({ a: 1, b: undefined })
  })

  it('should handle empty objects', () => {
    const origin = {}
    const target = {}
    const result = deepMerge(origin, target)
    expect(result).toEqual({})
  })
})
