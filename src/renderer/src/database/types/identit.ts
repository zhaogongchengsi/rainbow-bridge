export interface Identity {
  id: number
  uuid: string
  name: string
  email?: string
  comment?: string
  lastLoginTime?: number
  create_by: number
  avatar: string
  chats: string[]
}
