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
import { compact, omit, once } from 'lodash'
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
    isSelfSend: from.isMe,
  }
}

async function resolveChatState(chat: ChatData): Promise<ChatState> {
  return {
    ...chat,
    newMessages: [],
    messages: await map(chat.messages, resolveMessageState),
    lastMessage: chat.lastMessage ? await resolveMessageState(chat.lastMessage) : undefined,
    isOnline: false,
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

  function mapPrivateChat<T>(cb: (chat: ChatState) => T) {
    const privateChats = chats.filter(chat => !chat.isGroup)
    return privateChats.map((chat) => {
      return cb(chat)
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

  // once(async () => {
  //   const selfId = await getClientUniqueId()
  //   setInterval(async () => {
  //     await map(chats, async (chat) => {
  //       const receiverIds = chat.participants.filter(participant => participant !== selfId)
  //       await map(receiverIds, async (id) => {
  //         const user = await userDatabase.getUserById(id)
  //         if (!user) {
  //           return
  //         }

  //         try {
  //           const pong = await invoke<'pong'>(user.connectID, 'chat:ping', [chat.id, user.connectID])
  //           if (pong !== 'pong') {
  //             chat.isOnline = false
  //             return
  //           }
  //           chat.isOnline = true
  //         }
  //         catch (error: any) {
  //           chat.isOnline = false
  //           logger.error(`Ping user failed: ${error.message}`)
  //         }
  //       })
  //     })
  //   }, 3000)
  // })

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

    if (!chat.isOnline) {
      logger.warn('User is offline')
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
