<script setup lang='ts'>
import type { MessageState } from '@renderer/store/chat'

defineProps<{
  message: MessageState
}>()
</script>

<template>
  <div class="chat-message-item" :class="{ 'flex-row-reverse': message.isSelfSend }">
    <div class="chat-message-item-left">
      <ui-avatar class="size-12" :src="message.from.avatar" />
    </div>
    <div class="chat-message-item-body text-wrap">
      <p class="chat-message-item_content min-h-12 break-words text-wrap">
        {{ message.content }}
      </p>
    </div>
  </div>
</template>

<style>
  .chat-message-item {
    display: flex;
    padding: 5px 10px;
    gap: 10px;
  }

  .chat-message-item-body {
    min-width: 300px;
    max-width: 60%;
  }

  .chat-message-item_content {
    background-color: var(--rainbow-background-secondary);
    min-height: max-content;
    padding: 5px;
    border-radius: 4px;
  }
</style>
