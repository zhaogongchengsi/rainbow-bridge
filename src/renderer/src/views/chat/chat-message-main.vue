<script setup lang='ts'>
import Editor from '@renderer/components/editor'
import { useChat } from '@renderer/store/chat'
import { debounce } from 'perfect-debounce'
import { VirtList } from 'vue-virt-list'

const chatStore = useChat()
const router = useRoute()

const virtListRef = useTemplateRef('virtListRef')

const value = ref('')
const page = ref(1)

const currentChatId = computed(() => (router.params as any).id)

chatStore.setCurrentChatId(currentChatId.value)

function mock(length: number) {
  return Array.from({ length }).map((_, i) => ({ value: `Item #${i}` }))
}

const items = ref(mock(100))

onMounted(() => {
  if (virtListRef.value) {
    virtListRef.value.scrollToBottom()
  }
})

const sleep = () => new Promise(resolve => setTimeout(resolve, 1000))

async function toTop() {
  if (page.value <= 1)
    return
  await sleep()
  const list = mock(100)
  items.value = list.concat(items.value)
  await nextTick()
  virtListRef.value?.addedList2Top(list)
  page.value = page.value - 1
}

const onSend = debounce(async () => {
  if (!value.value)
    return

  await chatStore.sendTextMessage(currentChatId.value, value.value)
  value.value = ''
})
</script>

<template>
  <div class="chat-message-contianer">
    <div class="chat-main-header">
      <span>{{ chatStore.currentChat?.title }}</span>
    </div>
    <div class="chat-main-body">
      <VirtList ref="virtListRef" :list="chatStore.currentChat?.messages" item-key="id" :min-size="60" :buffer="10" @to-top="toTop">
        <template #default="{ itemData }">
          <div style="height: 60px;">
            {{ itemData.content }}
          </div>
        </template>
        <template v-if="page > 1" #header>
          <div
            style="
              width: 100%;
              height: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: chocolate;
            "
          >
            loading...
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
