<script setup lang="ts">
import { usePeerClientStatue } from '@renderer/client/use'

const peer = usePeerClientStatue()
</script>

<template>
  <div class="h-full flex items-center">
    <i v-if="peer.connecting" class="pi pi-spinner block animate-spin" />
    <i v-if="peer.connected" class="pi pi-circle-fill block text-base text-green-500" />
    <i v-if="peer.connectError" class="pi pi-circle block text-base text-red" />
  </div>
</template>
