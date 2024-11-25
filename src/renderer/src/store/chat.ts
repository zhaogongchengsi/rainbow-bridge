import type { Chat, ChatData } from '@renderer/database/chat'
import type { Message } from '@renderer/database/message'
import { usePeerClientMethods } from '@renderer/client/use'
import { chatDatabase } from '@renderer/database/chat'
import { type ExchangeUser, type User, userDatabase } from '@renderer/database/user'
import { map } from '@renderer/utils/async'
import { getClientUniqueId } from '@renderer/utils/id'
import { logger } from '@renderer/utils/logger'
import omit from 'lodash/omit'
import once from 'lodash/once'
import { useIdentity } from './identity'
import { useUser } from './user'

export interface MessageState extends Omit<Message, 'from'> {
  from: User
  isSelfSend: boolean
}

export interface ChatState extends Omit<ChatData, 'messages' | 'lastMessage'> {
  newMessages: MessageState[]
  messages: MessageState[]
  lastMessage?: MessageState
}

export type CreateChatRequest = Omit<Chat, 'messages'>

export async function resolveMessageState(message: Message): Promise<MessageState> {
  const selfId = await getClientUniqueId()

  const from = (await userDatabase.getUserById(message.from))!

  return {
    ...message,
    from,
    isSelfSend: message.from === selfId,
  }
}

async function resolveChatState(chat: ChatData): Promise<ChatState> {
  return {
    ...chat,
    newMessages: [],
    messages: await map(chat.messages, resolveMessageState),
    lastMessage: chat.lastMessage ? await resolveMessageState(chat.lastMessage) : undefined,
  }
}

export const useChat = defineStore('app-chat', () => {
  const chats = ref<ChatState[]>([])
  const currentChatId = useStorage<string>('current-chat-id', '')

  const user = useUser()
  const identity = useIdentity()
  const { registerHandler, sendMessage, on, invoke } = usePeerClientMethods()

  async function chatInit() {
    const _chats = await chatDatabase.getChats()

    chats.value = await map(_chats, resolveChatState)
  }

  const currentChat = computed(() => {
    return chats.value.find(chat => chat.id === currentChatId.value)
  })

  async function appNewChat(chat: ChatData) {
    chats.value.unshift(await resolveChatState(chat))
  }

  registerHandler('chat:create-private-chat', async (chat: Chat): Promise<boolean> => {
    logger.log('chat:create-private-chat')

    const newChat = await chatDatabase.createChatByCompleteInfo(chat)

    if (!newChat) {
      logger.error('passive create new chat failed')
      return false
    }

    await Promise.all(
      chat.participants.map(async (id) => {
        await user.requestAndCreateNewUser(id)
      }),
    )

    await appNewChat(newChat)

    return true
  })

  on('chat:message', async (message: Message) => {
    logger.log('chat:message')
    const chat = chats.value.find(chat => chat.id === message.to)
    if (!chat) {
      logger.error('Chat not found')
      return
    }
    try {
      await user.requestAndCreateNewUser(message.from)
      chatDatabase.createOriginalMessage(message)
      chat.lastMessage = await resolveMessageState(message)
      chat.newMessages.push(await resolveMessageState(message))
      chat.messages.push(await resolveMessageState(message))
    }
    catch (error: any) {
      logger.error(`Create message failed: ${error.message}`)
    }
  })

  async function createNewPrivateChat(userinfo: ExchangeUser) {
    const selfId = await getClientUniqueId()
    const current = identity.getCurrentIdentity()
    const newUser = await user.requestAndCreateNewUser(userinfo.id)
    const id = chatDatabase.createChatId()

    if (!newUser) {
      return
    }

    const chat = await chatDatabase.createPrivateChatChat({
      title: newUser.name,
      participants: [newUser.id, selfId],
      owner: selfId,
      avatar: newUser.avatar,
      isGroup: false,
      id,
    })

    if (!chat) {
      return
    }

    await invoke(userinfo.connectID, 'chat:create-private-chat', [{
      ...omit(chat, 'messages'),
      title: current.name,
      avatar: current.avatar,
      messages: [],
    }])

    await appNewChat(chat)

    return chat
  }

  async function sendTextMessage(id: string, text: string) {
    const chat = chats.value.find(chat => chat.id === id)
    if (!chat) {
      logger.warn('Chat not found')
      return
    }
    const selfId = await getClientUniqueId()

    const receiverIds = chat.participants.filter(participant => participant !== selfId)

    const newMessage = await chatDatabase.createTextMessage({
      content: text,
      from: selfId,
      to: chat.id,
      isImage: false,
      isText: true,
    })

    if (!newMessage) {
      logger.error('Create new message failed')
      return
    }

    await Promise.all(
      receiverIds.map(async (id) => {
        await sendMessage(id, newMessage)
      }),
    )

    await sendMessage(id, newMessage)

    chat.messages.push(await resolveMessageState(newMessage))
    chat.lastMessage = await resolveMessageState(newMessage)
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
    init: once(chatInit),
  }
})
