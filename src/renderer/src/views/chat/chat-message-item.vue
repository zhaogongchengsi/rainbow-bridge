<script setup lang='ts'>
import type { MessageState } from '@renderer/store/chat'
import uiTimestamp from '@renderer/components/ui/ui-timestamp.vue'

defineProps<{
  message: MessageState
}>()
</script>

<template>
  <div class="chat-message-item" :class="{ 'flex-row-reverse': message.isSelfSend }">
    <div class="chat-message-item-left">
      <ui-avatar class="size-12" :src="message.from.avatar" />
    </div>
    <div class="chat-message-item-body flex flex-col border-rounded-md p-2 text-wrap" :class="message.isSelfSend ? 'bg-blue-400 text-white' : 'dark:bg-zinc-800 bg-zinc-200'">
      <p class="chat-message-item_content min-h-12 break-words text-wrap text-base">
        {{ message.content }}
      </p>
      <div class="mt-auto w-full flex pt-2">
        <ui-timestamp class="text-xs" :time="message.timestamp" />
      </div>
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
    min-height: max-content;
  }
</style>
