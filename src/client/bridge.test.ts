import { describe, expect, it } from 'vitest'
import { Bridge } from './bridge'

const server = {
  host: 'localhost',
  port: 9000,
  path: '/bridge',
}

describe('bridge', () => {
  it('should create a bridge', () => {
    const bridge = new Bridge('1', {
      ...server,
    })

    expect(bridge.id).toBe('1')
    console.log(bridge.peerId)
  })
})
