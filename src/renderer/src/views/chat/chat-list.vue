<script setup lang="ts">
import type { ChatData } from '@renderer/database/chat'
import { ChatType, MessageState } from '@renderer/database/enums'

const menu = ref()

const chats = ref<ChatData[]>([
  {
    id: '1',
    type: ChatType.GROUP_CHAT,
    title: 'test',
    avatar: 'C:/Users/Administrator/.rainbow-bridge/files/wallhaven-l8y9yy.jpg',
    messages: [],
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '',
    description: '',
    isMute: false,
    isTop: false,
    isHide: false,
    lastMessage: {
      id: '',
      senderId: '',
      receiverId: '',
      content: '最后一条消息',
      timestamp: 0,
      status: MessageState.READ,
      isLastMessage: false,
      chatId: '',
    },
  },
  {
    id: '2',
    type: ChatType.GROUP_CHAT,
    title: 'test',
    avatar: 'C:/Users/Administrator/.rainbow-bridge/files/wallhaven-l8y9yy.jpg',
    messages: [],
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '',
    description: '',
    isMute: true,
    isTop: false,
    isHide: false,
    lastMessage: {
      id: '',
      senderId: '',
      receiverId: '',
      content: '最后一条消息',
      timestamp: 0,
      status: MessageState.READ,
      isLastMessage: false,
      chatId: '',
    },
  },
])

const items = ref([
  {
    label: 'Roles',
    icon: 'pi pi-users',
    items: [
      {
        label: 'Admin',
        command: () => {

        },
      },
      {
        label: 'Member',
        command: () => {

        },
      },
      {
        label: 'Guest',
        command: () => {

        },
      },
    ],
  },
  {
    label: 'Invite',
    icon: 'pi pi-user-plus',
    command: () => {

    },
  },
])

function onRightClick(event, user) {
  console.log(user)
  menu.value.show(event)
}
</script>

<template>
  <ScrollPanel style="width: 100%; height: 100% ">
    <ul class="chat-list-contianer">
      <li v-for="chat in chats" :key="chat.id" class="chat-list-item" @contextmenu="onRightClick($event, chat)">
        <router-link class="chat-list-item-link block size-full" :to="`/main/chat/${chat.id}`">
          <div class="size-full flex gap-2">
            <div class="chat-avatar">
              <ui-avatar class="size-full" :src="chat.avatar" />
            </div>
            <div class="min-w-0 flex flex-1 flex-col justify-between">
              <span class="block w-full truncate text-lg">{{ chat.title }}</span>
              <p v-if="chat.lastMessage" class="block w-full truncate text-xs text-zinc-500">
                {{ chat.lastMessage?.content }}
              </p>
            </div>
            <div class="flex flex-col items-end justify-between">
              <span class="block w-full truncate text-xs text-zinc-500">2021-10-10</span>
              <i v-if="chat.isMute" class="pi-bell-slash pi text-zinc-500" />
            </div>
          </div>
        </router-link>
      </li>
      <ContextMenu ref="menu" :model="items" />
    </ul>
  </ScrollPanel>
</template>

<style>
  .chat-list-contianer {
    width: 100%;
    --chat-list-item-height: 90px;
    --chat-list-item-padding: 18px;
    --chat-list-item-hover-color: #e5e5e5;
    --chat-list-item-active-color: #e4e4e4;
  }

  .dark .chat-list-contianer {
    --chat-list-item-hover-color: #333;
    --chat-list-item-active-color: #3b3b3b;
  }

  .chat-list-item {
    height: var(--chat-list-item-height);
    cursor: pointer;
  }

  .chat-list-item:hover {
    background-color: var(--chat-list-item-hover-color);
  }

  .chat-list-item-link {
    padding: var(--chat-list-item-padding);
  }

  .chat-list-item-link.router-link-active {
    background-color: var(--chat-list-item-active-color);
  }

  .chat-avatar {
    width: calc(var(--chat-list-item-height) - 2 * var(--chat-list-item-padding));
  }
</style>
