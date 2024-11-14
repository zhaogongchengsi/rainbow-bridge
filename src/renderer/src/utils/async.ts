export function withTimeout<T>(promise: Promise<T> | (() => Promise<T>), timeout: number = 3000): Promise<T> {
  return Promise.race([
    typeof promise === 'function' ? promise() : promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
  ])
}
