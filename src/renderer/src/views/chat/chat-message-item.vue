<script setup lang='ts'>
import type { MessageState } from '@renderer/store/chat'

defineProps<{
  message: MessageState
}>()
</script>

<template>
  <div class="chat-message-item">
    <div class="chat-message-item-left">
      <ui-avatar :src="message.senderId.avatar" />
    </div>
    <div class="chat-message-item-body">
      <span>{{ message.content }}</span>
    </div>
  </div>
</template>

<style>
  .chat-message-item {
    display: flex;
  }
</style>
