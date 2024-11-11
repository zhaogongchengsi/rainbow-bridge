// 生成固定长度的 IV，使用指定的填充字符
function generateIV(salt: string, fillChar: string = '0'): Uint8Array {
  const encoder = new TextEncoder()
  const encodedSalt = encoder.encode(salt)
  const iv = new Uint8Array(12)
  iv.set(encodedSalt.slice(0, 12)) // 截断
  if (encodedSalt.length < 12) {
    iv.set(new TextEncoder().encode(fillChar.repeat(12 - encodedSalt.length)), encodedSalt.length) // 填充
  }
  return iv
}

// 生成密钥
async function generateKey(salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(salt),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

// 加密字符串
export async function encryptString(data: string, salt: string): Promise<string> {
  const key = await generateKey(salt)
  const iv = generateIV(salt)
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData,
  )

  // 将 IV 和加密数据合并为一个字符串
  const buffer = new Uint8Array(iv.byteLength + encryptedData.byteLength)
  buffer.set(iv, 0)
  buffer.set(new Uint8Array(encryptedData), iv.byteLength)
  return btoa(String.fromCharCode(...buffer))
}

// 解密字符串
export async function decryptString(encryptedData: string, salt: string): Promise<string> {
  try {
    const key = await generateKey(salt)
    const buffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    const iv = buffer.slice(0, 12)
    const data = buffer.slice(12)

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  }
  catch (error: any) {
    throw new Error(`Failed to decrypt data: ${error.message}`)
  }
}

export async function encryptObjectToBuffer(obj: any, salt: string): Promise<ArrayBuffer> {
  const key = await generateKey(salt)
  const iv = generateIV(salt)
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(obj))
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  )

  // 将 IV 和加密数据合并为一个 ArrayBuffer
  const buffer = new Uint8Array(iv.byteLength + encryptedData.byteLength)
  buffer.set(iv, 0)
  buffer.set(new Uint8Array(encryptedData), iv.byteLength)
  return buffer.buffer
}

// 解密 ArrayBuffer 并还原为对象
export async function decryptBufferToObject(buffer: ArrayBuffer, salt: string): Promise<any> {
  const key = await generateKey(salt)
  const uint8Array = new Uint8Array(buffer)
  const iv = uint8Array.slice(0, 12)
  const data = uint8Array.slice(12)

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data,
  )

  const decoder = new TextDecoder()
  const jsonString = decoder.decode(decryptedData)
  return JSON.parse(jsonString)
}
