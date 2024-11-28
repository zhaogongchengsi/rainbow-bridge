import type { Chat, ChatData } from '@renderer/database/chat'
import type { Message } from '@renderer/database/message'
import type { ID } from '@renderer/database/type'
import type { SelfUser, User } from '@renderer/database/user'
import { usePeerClientMethods } from '@renderer/client/use'
import { chatDatabase } from '@renderer/database/chat'
import { userDatabase } from '@renderer/database/user'
import { map } from '@renderer/utils/async'
import { getClientUniqueId } from '@renderer/utils/id'
import { logger } from '@renderer/utils/logger'
import omit from 'lodash/omit'
import once from 'lodash/once'
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
  const from = (await userDatabase.getUserById(message.from))!

  return {
    ...message,
    from,
    isSelfSend: from.isMe,
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
  const chats = reactive<ChatState[]>([])
  const currentChatId = useStorage<string>('current-chat-id', '')

  const userStore = useUser()
  const { registerHandler, sendMessage, on, invoke } = usePeerClientMethods()

  async function chatInit() {
    const _chats = await chatDatabase.getChats();
    (await map(_chats, resolveChatState)).forEach(c => chats.push(c))
  }

  const currentChat = computed(() => {
    return chats.find(chat => chat.id === currentChatId.value)
  })

  async function appNewChat(chat: ChatData) {
    chats.push(await resolveChatState(chat))
  }

  function findChatById(id: string) {
    return chats.find(c => c.id === id)
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
        await userStore.requestAndCreateNewUser(id)
      }),
    )

    await appNewChat(newChat)

    return true
  })

  on('chat:message', async (message: Message) => {
    logger.log('chat:message')
    const chat = findChatById(message.to)
    if (!chat) {
      logger.error('Chat not found')
      return
    }
    try {
      await userStore.requestAndCreateNewUser(message.from)
      chatDatabase.createOriginalMessage(message)
      chat.lastMessage = await resolveMessageState(message)
      chat.newMessages.push(await resolveMessageState(message))
      chat.messages.push(await resolveMessageState(message))
    }
    catch (error: any) {
      logger.error(`Create message failed: ${error.message}`)
    }
  })

  async function createNewPrivateChat(userinfo: SelfUser) {
    const selfId = await getClientUniqueId()
    const current = userStore.getCurrentUser()
    const newUser = await userStore.upsertUser(userinfo)
    const id = chatDatabase.createChatId()

    if (!newUser) {
      return
    }

    const chat = await chatDatabase.createPrivateChatChat({
      title: newUser.name,
      participants: [newUser.id, current.id],
      owner: selfId,
      description: newUser.comment,
      avatar: newUser.avatar,
      isGroup: false,
      id,
    })

    if (!chat) {
      return
    }

    await userStore.cloneUser(userinfo.connectID)

    await invoke(userinfo.connectID, 'chat:create-private-chat', [{
      ...omit(chat, 'messages'),
      title: current.name,
      avatar: current.avatar,
      description: current.comment,
      messages: [],
    }])

    await appNewChat(chat)

    return chat
  }

  async function sendTextMessage(id: ID, text: string) {
    const chat = findChatById(id)

    if (!chat) {
      logger.warn('Chat not found')
      return
    }

    const current = userStore.getCurrentUser()

    const receiverIds = chat.participants.filter(participant => participant !== current.id)

    const newMessage = await chatDatabase.createTextMessage({
      content: text,
      from: current.id,
      to: chat.id,
      isImage: false,
      isText: true,
    })

    if (!newMessage) {
      logger.error('Create new message failed')
      return
    }

    await map(receiverIds, async (id) => {
      const user = await userDatabase.getUserById(id)
      if (user) {
        return await sendMessage(user.connectID, newMessage)
      }
    })

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
