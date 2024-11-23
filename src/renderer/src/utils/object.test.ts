import { describe, expect, it } from 'vitest'
import { findFileKeys, isFilePath } from './object'

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
})
