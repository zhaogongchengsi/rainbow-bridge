<script setup lang="ts">
import { createGlobalHandle } from '@renderer/composables/define'
import { useChat } from './store/chat'

const chat = useChat()

createGlobalHandle()
chat.init()
</script>

<template>
  <div class="h-screen w-full">
    <RouterView />
  </div>
</template>
