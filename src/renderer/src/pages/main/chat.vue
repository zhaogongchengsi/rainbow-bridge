<script setup lang="ts">
import ChatList from '@renderer/views/chat/chat-list.vue'
import ChatSearchInput from '@renderer/views/chat/chat-search-input.vue'
import { Pane, Splitpanes } from 'splitpanes'
</script>

<template>
  <Splitpanes style="height: var(--system-container-box-height)">
    <Pane size="20" max-size="25" min-size="15">
      <div class="chat-left-container">
        <ChatSearchInput />
        <div class="chat-left-body">
          <ChatList />
        </div>
      </div>
    </Pane>
    <Pane size="80">
      <router-view />
    </Pane>
  </Splitpanes>
</template>

<style>
  .chat-left-container {
    height: var(--system-container-box-height);
    --chat-left-header-height: 80px;
  }

  .chat-left-body {
    --chat-left-body-height: calc(100% - var(--chat-left-header-height));
    height: var(--chat-left-body-height);
  }
</style>
