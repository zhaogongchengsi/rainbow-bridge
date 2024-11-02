<script setup lang="ts">
import SystemClose from '@renderer/views/system/system-close.vue'
import SystemFullscreen from '@renderer/views/system/system-fullscreen.vue'
import Theme from '@renderer/views/system/system-theme.vue'
import SystemZoomOut from '@renderer/views/system/system-zoom-out.vue'
</script>

<template>
  <div class="system-top-bar draggable flex">
    <div class="ml-auto inline-flex items-center gap-2">
      <Theme />
      <SystemZoomOut />
      <SystemFullscreen />
      <SystemClose />
    </div>
  </div>
</template>
