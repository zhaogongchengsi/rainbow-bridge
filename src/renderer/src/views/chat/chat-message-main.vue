<script setup lang='ts'>
import type { MessageState } from '@renderer/store/chat'
import Editor from '@renderer/components/editor'
import { useChat } from '@renderer/store/chat'
import { debounce } from 'perfect-debounce'
import { VirtList } from 'vue-virt-list'
import chatMessageItem from './chat-message-item.vue'

const chatStore = useChat()
const router = useRoute()

const virtListRef = useTemplateRef('virtListRef')

const value = ref('')

const currentChatId = computed(() => (router.params as any).id)

chatStore.setCurrentChatId(currentChatId.value)

onMounted(async () => {
  if (virtListRef.value) {
    await nextTick()
    virtListRef.value.scrollToBottom()
  }
})

async function toTop() {
  const currentChat = chatStore.currentChat
  if (!currentChat)
    return
  if (currentChat.totalPage === 1)
    return
  const messages = await chatStore.loadPreviousMessages(currentChatId.value)
  if (messages) {
    await nextTick()
    virtListRef.value?.addedList2Top(messages)
  }
}

watch(() => chatStore.currentChat?.lastMessage, () => {
  if (virtListRef.value) {
    virtListRef.value.scrollToBottom()
  }
})

const onSend = debounce(async () => {
  if (!value.value.trim())
    return

  await chatStore.sendTextMessage(currentChatId.value, value.value.trim())
  value.value = ''
})
</script>

<template>
  <div v-if="chatStore.currentChat" class="chat-message-contianer">
    <div class="chat-main-header">
      <span>{{ chatStore.currentChat.title }}</span>
    </div>
    <div class="chat-main-body py-5">
      <VirtList
        ref="virtListRef" :list="chatStore.currentChat.messages" item-key="id" :min-size="60" :buffer="10"
        @to-top="toTop"
      >
        <template #default="{ itemData }">
          <chat-message-item :message="itemData" />
        </template>
        <template v-if="chatStore.currentChat.page < chatStore.currentChat.totalPage " #header>
          <div class="h-4 w-full flex items-center justify-center">
            <i class="pi pi-spin pi-spinner size-4 origin-center" />
          </div>
        </template>
      </VirtList>
    </div>
    <div class="chat-main-footer">
      <div class="chat-main-footer_header">
        tool
      </div>
      <div class="chat-main-footer_editor">
        <Editor v-model:text="value" />
        <div class="chat-main-footer_send">
          <Button label="Send" class="w-25" severity="contrast" @click="onSend" />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p class="text-center text-gray-500">
      No chat selected
    </p>
  </div>
</template>

<style>
  .chat-message-contianer {
    min-width: 0;
    flex: 1;
    height: 100%;

    --chat-main-header-height: 80px;
    --chat-main-footer-height: 320px;
    --chat-main-px: 20px;
    --chat-main-py: 10px;

    display: flex;
    flex-direction: column;
  }

  .chat-main-header {
    height: var(--chat-main-header-height);
    border-bottom: 1px solid var(--rainbow-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--chat-main-py) var(--chat-main-px);
  }

  .chat-main-body {
    height: calc(100% - var(--chat-main-footer-height) - var(--chat-main-header-height) - 3px)
  }

  .chat-main-footer {
    height: var(--chat-main-footer-height);
    border-top: 1px solid var(--rainbow-border-color);

    .chat-main-footer_header {
      padding: var(--chat-main-py) var(--chat-main-px);
      height: 60px;
      border-bottom: 1px solid var(--rainbow-border-color);
    }

    .chat-main-footer_editor {
      height: 200px;
    }

    .chat-main-footer_send {
      height: 60px;
      display: flex;
      justify-content: end;
      align-items: center;
      padding: 0 var(--chat-main-px);
    }
  }
</style>
