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
  const iv = crypto.getRandomValues(new Uint8Array(12))
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
