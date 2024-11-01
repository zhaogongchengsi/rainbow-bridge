export interface WebHandleConfig {
  id: string
  args: any[]
  method: string
}

export interface WebHandleResponse {
  id: string
  result: any
  error: any
}
