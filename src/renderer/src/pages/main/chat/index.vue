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
    <div>
      <div v-for="chat in chats" :key="chat.id">
        <div>{{ chat.title }}</div>
      </div>
    </div>
  </ScrollPanel>
</template>
