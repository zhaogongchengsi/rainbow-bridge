<script setup lang="ts">
import type { SelfUser } from '@renderer/database/user'
import { useChat } from '@renderer/store/chat'
import { useUser } from '@renderer/store/user'
import { debounce } from 'perfect-debounce'
import Menu from 'primevue/menu'

const chat = useChat()
const userStore = useUser()

const menu = ref<InstanceType<typeof Menu> | null>(null)
const visible = ref(false)

const value = ref('')
const friendId = ref('')
const searchIng = ref(false)
const searchUser = ref<SelfUser>()

const items = [
  {
    label: 'Create Group',
    icon: 'pi pi-users',
    command: () => {
      // console.log('Light')
    },
  },
  {
    label: 'Add friend',
    icon: 'pi pi-user',
    command: () => {
      visible.value = true
    },
  },
]
function toggle(event: MouseEvent) {
  menu.value?.toggle(event)
}
const onSearch = debounce(async () => {
  if (!friendId.value) {
    searchUser.value = undefined
    return
  }

  searchIng.value = true

  try {
    const user = await userStore.searchFriend(friendId.value)

    if (!user) {
      return
    }

    searchUser.value = user
  }
  catch (error) {
    searchUser.value = undefined
    console.error(error)
  }
  finally {
    searchIng.value = false
  }
})

const onSeyHello = debounce(async () => {
  if (!searchUser.value)
    return

  const newChat = await chat.createNewPrivateChat(searchUser.value)
  if (!newChat) {
    console.error('create chat failed')
    return
  }
  chat.sendTextMessage(newChat.id, 'Hello')
})
</script>

<template>
  <div class="chat-left-header px-4 py-3">
    <input v-model="value" class="chat-left-header_input" placeholder="Search">
    <button class="chat-left-header_button" @click="toggle">
      <i class="pi pi-plus" />
    </button>
    <Menu ref="menu" :model="items" :popup="true" />
    <Dialog v-model:visible="visible" modal header="Search friend">
      <div class="h-100 w-150 flex flex-col">
        <InputGroup>
          <InputText v-model="friendId" placeholder="id" />
          <Button label="Search" raised severity="contrast" @click="onSearch" />
        </InputGroup>
        <Divider />
        <div class="flex flex-1 flex-col">
          <div v-if="searchIng" class="flex flex-1 flex-col justify-center">
            <ProgressSpinner />
          </div>
          <div v-if="!searchUser && !searchIng" class="flex flex-1 flex-col justify-center">
            <p class="text-center text-gray-500">
              No user found
            </p>
          </div>
          <div v-else-if="!searchIng && searchUser" class="w-full flex flex-1 flex-col items-center justify-center gap-6 py-4">
            <ui-avatar v-if="searchUser.avatar" :src="searchUser.avatar" class="block size-20" />
            <div class="flex flex-col gap-4">
              <span class="text-lg font-bold">{{ searchUser?.name }}</span>
              <span class="text-sm text-gray-500">{{ searchUser?.email }}</span>
            </div>
          </div>
          <Button label="say hello" class="mt-auto w-full" raised severity="contrast" @click="onSeyHello" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style>
  .chat-left-header {
    --chat-h: 40px;

    height: var(--chat-left-header-height);
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--rainbow-border-color);

    .chat-left-header_input {
      width: calc(100% - 40px - 10px);
      height: var(--chat-h);
      outline: none;
      background-color: var(--rainbow-background-secondary);
      border: none;
      border-radius: var(--rainbow-border-radius);
      padding: 0 10px;
    }

    .chat-left-header_button {
      width: var(--chat-h);
      height: var(--chat-h);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--rainbow-border-radius);
      background-color: var(--rainbow-background-secondary);
    }
  }
</style>
