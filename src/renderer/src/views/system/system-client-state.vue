<script setup lang="ts">
import { usePeerClient } from '@renderer/client/use'

const peer = usePeerClient()
</script>

<template>
  <div class="h-full flex items-center">
    <i v-if="peer.connecting && !peer.connectError" class="pi pi-spinner block animate-spin" />
    <i v-if="peer.connected && !peer.connectError" class="pi pi-circle-fill block text-base text-green-500" />
    <i v-if="peer.connectError" class="pi pi-circle-fill block text-base text-red" />
  </div>
</template>
