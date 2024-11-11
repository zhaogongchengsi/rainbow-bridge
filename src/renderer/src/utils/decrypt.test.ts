import { describe, expect, it } from 'vitest'
import { decryptString, encryptString } from './decrypt'

describe('decrypt', () => {
  it('should decrypt the encrypted data', async () => {
    const originalString = 'This is a string that needs to be encrypted.'
    const salt = 'my-salt-value'

    const encryptedString = await encryptString(originalString, salt)

    const decryptedString = await decryptString(encryptedString, salt)

    expect(decryptedString).toBe(originalString)
  })
})
