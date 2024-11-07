<script setup lang="ts">
import ChatSearchInput from '@renderer/views/chat/chat-search-input.vue'
import { Pane, Splitpanes } from 'splitpanes'
</script>

<template>
  <Splitpanes style="height: var(--system-container-box-height)">
    <Pane min-size="15" max-size="20">
      <div class="chat-left-container">
        <ChatSearchInput />
        <div class="chat-left-body">
          <router-view />
        </div>
      </div>
    </Pane>
    <Pane>
      message
    </Pane>
  </Splitpanes>
</template>

<style>
  .chat-left-container {
    height: var(--system-container-box-height);
    --chat-left-header-height: 80px;
  }

  .chat-left-body {
    height: calc(100% - var(--chat-left-header-height));
  }
</style>
