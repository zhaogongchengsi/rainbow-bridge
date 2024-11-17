<script setup lang="ts">
import type { ChatData } from '@renderer/database/chat'
import { ChatType } from '@renderer/database/enums'

const chats = ref<ChatData[]>([
  {
    id: '1',
    type: ChatType.GROUP_CHAT,
    title: 'test',
    avatar: '',
    messages: [],
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '',
    description: '',
    isMute: false,
    isTop: false,
    isHide: false,
  },
  {
    id: '2',
    type: ChatType.GROUP_CHAT,
    title: 'test',
    avatar: '',
    messages: [],
    participants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '',
    description: '',
    isMute: false,
    isTop: false,
    isHide: false,
  },
])
</script>

<template>
  <ScrollPanel style="width: 100%; height: 100% ">
    <ul class="chat-list-contianer">
      <li v-for="chat in chats" :key="chat.id" class="chat-list-item">
        <div>{{ chat.title }}</div>
      </li>
    </ul>
  </ScrollPanel>
</template>

<style>
  .chat-list-contianer {
    width: 100%;
    --chat-list-item-height: 80px;
  }

  .chat-list-item {
    height: var(--chat-list-item-height);
  }
</style>
