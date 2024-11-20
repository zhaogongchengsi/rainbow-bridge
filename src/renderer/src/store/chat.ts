import type { Chat, ChatData } from '@renderer/database/chat'
import type { Message } from '@renderer/database/message'
import type { ExchangeUser } from '@renderer/database/user'
import { usePeerClientMethods } from '@renderer/client/use'
import { chatDatabase } from '@renderer/database/chat'
import { getClientUniqueId } from '@renderer/utils/id'
import { logger } from '@renderer/utils/logger'
import once from 'lodash/once'
import { useUser } from './user'

export interface ChatState extends ChatData {
  newMessages: Message[]
}

export const useChat = defineStore('app-chat', () => {
  const chats = ref<ChatState[]>([])
  const currentChatId = useStorage<string>('current-chat-id', '')

  const { registerHandler, sendMessage, on, invoke } = usePeerClientMethods()

  const user = useUser()

  async function init() {
    const _chats = await chatDatabase.getChats()

    chats.value = _chats.map((chat) => {
      return {
        ...chat,
        newMessages: [],
      }
    })
  }

  once(init)()

  const currentChat = computed(() => {
    return chats.value.find(chat => chat.id === currentChatId.value)
  })

  function appNewChat(chat: ChatData) {
    chats.value.unshift({
      ...chat,
      newMessages: [],
    })
  }

  registerHandler('chat:create-private-chat', async (chat: Chat): Promise<boolean> => {
    logger.log('chat:create-private-chat')
    const newChat = await chatDatabase.createChatByCompleteInfo(chat)
    if (!newChat) {
      logger.error('passive create new chat failed')
      return false
    }

    appNewChat(newChat)
    return true
  })

  on('chat:message', (message: Message) => {
    logger.log('chat:message')
    console.log(message)
    const chat = chats.value.find(chat => chat.id === message.chatId)
    if (!chat) {
      logger.error('Chat not found')
      return
    }
    try {
      chatDatabase.createOriginalMessage(message)
      chat.lastMessage = message
      chat.newMessages.push(message)
      chat.messages.push(message)
    }
    catch (error: any) {
      logger.error(`Create message failed: ${error.message}`)
    }
  })

  async function createNewPrivateChat(userinfo: ExchangeUser) {
    const selfId = await getClientUniqueId()

    const newUser = await user.createUser(userinfo)

    if (!newUser) {
      return
    }

    const chat = await chatDatabase.createPrivateChatChat({
      title: newUser.name,
      participants: [newUser.id, selfId],
      owner: selfId,
      avatar: newUser.avatar,
      isGroup: false,
      id: userinfo.connectID,
    })

    if (!chat) {
      return
    }

    // TODO: Notify the opposite side to create a new room

    appNewChat(chat)

    return chat
  }

  async function sendTextMessage(id: string, text: string) {
    const chat = chats.value.find(chat => chat.id === id)
    if (!chat) {
      logger.warn('Chat not found')
      return
    }

    const newMessage = await chatDatabase.createTextMessage({
      content: text,
      senderId: await getClientUniqueId(),
      receiverId: id,
      chatId: chat.id,
    })

    if (!newMessage) {
      logger.error('Create new message failed')
      return
    }

    console.log(newMessage)

    return await sendMessage(id, newMessage)
  }

  function setCurrentChatId(id: string) {
    currentChatId.value = id
  }

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewPrivateChat,
    currentChat,
    sendTextMessage,
  }
})
