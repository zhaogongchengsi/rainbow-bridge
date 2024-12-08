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
import { omit, once } from 'lodash'
import { useUser } from './user'

export interface MessageState extends Omit<Message, 'from'> {
  from: User
  isSelfSend: boolean
}

export interface ChatState extends Omit<ChatData, 'messages' | 'lastMessage'> {
  newMessages: MessageState[]
  messages: MessageState[]
  lastMessage?: MessageState
  isOnline: boolean
}

export type CreateChatRequest = Omit<Chat, 'messages'>

export async function resolveMessageState(message: Message): Promise<MessageState> {
  const from = (await userDatabase.getUserById(message.from))!

  return {
    ...message,
    from,
    isSelfSend: from?.isMe || false,
  }
}

async function resolveChatState(chat: ChatData, isOnline: boolean = false): Promise<ChatState> {
  return {
    ...chat,
    newMessages: [],
    messages: await map(chat.messages, resolveMessageState),
    lastMessage: chat.lastMessage ? await resolveMessageState(chat.lastMessage) : undefined,
    isOnline,
  }
}

export const useChat = defineStore('app-chat', () => {
  const chats = reactive<ChatState[]>([])
  const currentChatId = useStorage<string>('current-chat-id', '')

  const userStore = useUser()
  const { registerHandler, sendMessage, on, invoke } = usePeerClientMethods()

  async function chatInit() {
    const _chats = await chatDatabase.getChats();
    (await map(_chats, chat => resolveChatState(chat))).forEach(c => chats.push(c))
  }

  const currentChat = computed(() => {
    return chats.find(chat => chat.id === currentChatId.value)
  })

  async function appNewChat(chat: ChatData, isOnline: boolean = false) {
    chats.push(await resolveChatState(chat, isOnline))
  }

  function findChatById(id: string) {
    return chats.find(c => c.id === id)
  }

  async function mapPrivateChat<T>(cb: (chat: ChatState) => T | Promise<T>) {
    const privateChats = chats.filter(chat => !chat.isGroup)
    return await map(privateChats, async (chat) => {
      return await cb(chat)
    })
  }

  registerHandler('chat:ping', async (chatId: string, id: string) => {
    logger.silly(`chat:ping ${chatId} ${id}`)
    return 'pong'
  })

  on('user:login', async (user: SelfUser) => {
    mapPrivateChat((chat) => {
      if (chat.participants.includes(user.id)) {
        chat.isOnline = true
      }
    })
  })

  on('user:logout', async (user: SelfUser) => {
    mapPrivateChat((chat) => {
      if (chat.participants.includes(user.id)) {
        chat.isOnline = false
      }
    })
  })

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
      chatDatabase.saveMessage(message)
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

    await appNewChat(chat, true)

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

    const newMessage = chatDatabase.createTextMessage({
      content: text,
      from: current.id,
      to: chat.id,
      isImage: false,
      isText: true,
      isAudio: false,
      isVideo: false,
    })

    try {
      await map(receiverIds, async (id) => {
        const user = await userDatabase.getUserById(id)
        if (user) {
          return await sendMessage(user.connectID, newMessage)
        }
      })
      chatDatabase.saveMessage(newMessage)
      chat.messages.push(await resolveMessageState(newMessage))
      chat.lastMessage = await resolveMessageState(newMessage)
    }
    catch (error: any) {
      logger.error(`Send message failed: ${error.message}`)
    }
  }

  function setCurrentChatId(id: string) {
    currentChatId.value = id
  }

  async function loadPreviousMessages(chatId: string) {
    const chat = findChatById(chatId)

    if (!chat) {
      logger.warn('Chat not found')
      return
    }

    const currentPage = chat.page

    if (chat.totalPage <= currentPage) {
      return
    }

    const { messages, page, pageSize, totalPage } = await chatDatabase.getMessagesByChatIdWithPagination(chat.id, currentPage + 1, chat.pageSize)

    chat.messages = (await map(messages, resolveMessageState)).concat(chat.messages)
    chat.page = page
    chat.pageSize = pageSize
    chat.totalPage = totalPage

    return messages
  }

  return {
    chats,
    currentChatId,
    setCurrentChatId,
    createNewPrivateChat,
    currentChat,
    sendTextMessage,
    loadPreviousMessages,
    init: once(chatInit),
  }
})
