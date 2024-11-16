<script setup lang="ts">
import { createGlobalHandle } from '@renderer/composables/define'

createGlobalHandle()
</script>

<template>
  <div class="h-screen w-full">
    <RouterView />
  </div>
</template>
