<script setup lang="ts">
import SystemClose from '@renderer/views/system/system-close.vue'
import SystemFullscreen from '@renderer/views/system/system-fullscreen.vue'
import SystemFullscreenExit from '@renderer/views/system/system-fullscreen-exit.vue'
import Theme from '@renderer/views/theme.vue'

console.log('home')
</script>

<template>
  <div class="h-screen w-full">
    <Theme />
    <SystemFullscreen />
    <SystemFullscreenExit />
    <SystemClose />
  </div>
</template>
