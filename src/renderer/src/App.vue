<script setup lang="ts">
import { createGlobalHandle } from '@renderer/composables/define'
import { useChat } from './store/chat'
import { useUser } from './store/user'

const chat = useChat()
const user = useUser()

createGlobalHandle()
chat.init()
user.init()
</script>

<template>
  <div class="h-screen w-full">
    <RouterView />
  </div>
</template>
