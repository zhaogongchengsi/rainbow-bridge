<script setup lang="ts">
import { createClientSingle } from '@renderer/client/client'
import { createGlobalHandle } from '@renderer/composables/define'

// createClientSingle()
createGlobalHandle()
</script>

<template>
  <div class="h-screen w-full">
    <RouterView />
  </div>
</template>
