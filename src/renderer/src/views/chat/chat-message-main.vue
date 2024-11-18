<script setup lang='ts'>
import Editor from '@renderer/components/editor'
</script>

<template>
  <div class="chat-message-contianer">
    <div class="chat-main-header">
      <span>{{ $route.params.id }}</span>
    </div>
    <div class="chat-main-body">
      message
    </div>
    <div class="chat-main-footer">
      <div class="chat-main-footer_header">
        tool
      </div>
      <div class="chat-main-footer_editor">
        <Editor />
      </div>
    </div>
  </div>
</template>

<style>
  .chat-message-contianer {
    min-width: 0;
    flex: 1;
    height: 100%;

    --chat-main-header-height: 80px;
    --chat-main-footer-height: 260px;
    --chat-main-px: 20px;
    --chat-main-py: 10px;

    display: flex;
    flex-direction: column;
  }

  .chat-main-header {
    height: var(--chat-main-header-height);
    border-bottom: 1px solid var(--rainbow-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--chat-main-py) var(--chat-main-px);
  }

  .chat-main-body {
    flex: 1;

  }

  .chat-main-footer {
    height: var(--chat-main-footer-height);
    border-top: 1px solid var(--rainbow-border-color);

    .chat-main-footer_header {
      padding: var(--chat-main-py) var(--chat-main-px);
      height: 60px;
      border-bottom: 1px solid var(--rainbow-border-color);
    }

    .chat-main-footer_editor {
      height: 200px;
    }
  }
</style>
