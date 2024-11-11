import { describe, expect, it } from 'vitest'
import { decryptBufferToObject, decryptString, encryptObjectToBuffer, encryptString } from './decrypt'

describe('decrypt', () => {
  it('should decrypt the encrypted data', async () => {
    const originalString = 'This is a string that needs to be encrypted.'
    const salt = 'my-salt-value'

    const encryptedString = await encryptString(originalString, salt)

    const decryptedString = await decryptString(encryptedString, salt)

    expect(decryptedString).toBe(originalString)
  })

  it('should decrypt the encrypted any Object data', async () => {
    const a = { a: 1, b: 2, c: { c: 3, d: 4 } }

    const data = await encryptObjectToBuffer(a, 'salt')

    expect(data).toBeInstanceOf(ArrayBuffer)

    const decryptedData = await decryptBufferToObject(data, 'salt')

    expect(decryptedData).toEqual(a)
  })

  it('should decrypt the encrypted any Array data', async () => {
    const a = [1, 2, 3, 4]

    const data = await encryptObjectToBuffer(a, 'salt')

    expect(data).toBeInstanceOf(ArrayBuffer)

    const decryptedData = await decryptBufferToObject(data, 'salt')

    expect(decryptedData).toEqual(a)
  })

  it('should decrypt the encrypted any String data', async () => {
    const a = 'This is a string that needs to be encrypted.'

    const data = await encryptObjectToBuffer(a, 'salt')

    expect(data).toBeInstanceOf(ArrayBuffer)

    const decryptedData = await decryptBufferToObject(data, 'salt')

    expect(decryptedData).toEqual(a)
  })

  it('should decrypt the encrypted large object data', async () => {
    const largeObject = { data: 'x'.repeat(10 * 1024 * 1024) } // 10 MB object

    const data = await encryptObjectToBuffer(largeObject, 'salt')

    expect(data).toBeInstanceOf(ArrayBuffer)

    const decryptedData = await decryptBufferToObject(data, 'salt')

    expect(decryptedData).toEqual(largeObject)
  })
})
