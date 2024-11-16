export function withTimeout<T>(promise: Promise<T> | (() => Promise<T>), timeout: number = 3000): Promise<T> {
  return Promise.race([
    typeof promise === 'function' ? promise() : promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
  ])
}

export async function map<T, K>(array: readonly T[], asyncMapFunc: (item: T, index: number) => Promise<K>): Promise<K[]> {
  if (!array)
    return []
  const result: Awaited<K>[] = []
  let index = 0
  for (const value of array) {
    const newValue = await Promise.resolve(asyncMapFunc(value, index++))
    result.push(newValue)
  }
  return result
}
