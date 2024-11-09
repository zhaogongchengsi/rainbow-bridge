<script setup lang="ts">
import SystemClientState from '@renderer/views/system/system-client-state.vue'

const isMacos = window.is.isMacOS
</script>

<template>
  <div class="h-full px-5" :class="{ 'ml-auto': isMacos }">
    <SystemClientState />
  </div>
</template>
