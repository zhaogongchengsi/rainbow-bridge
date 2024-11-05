<script setup lang="ts">
import { Bridge } from '@client/bridge'
import SystemContainer from '@renderer/views/system/system-container.vue'

onMounted(async () => {
  const id = await window.system.getID()

  const client = new Bridge(id)
})
</script>

<template>
  <SystemContainer>
    <router-view />
  </SystemContainer>
</template>
