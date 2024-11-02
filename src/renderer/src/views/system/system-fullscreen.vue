<script setup lang="ts">
import { useDefineHandle } from '@renderer/composables/define'
import { invoke } from '@renderer/utils/ipc'

const isFullscreen = ref(false)

useDefineHandle('app:maximize', () => {
  isFullscreen.value = true
})
useDefineHandle('app:unmaximize', () => {
  isFullscreen.value = false
})

function onClick() {
  invoke('app:toggle-fullscreen')
}
</script>

<template>
  <button class="system-top-button" @click="onClick">
    <i class="block" :class="!isFullscreen ? 'i-ic-baseline-fullscreen' : 'i-ic-baseline-fullscreen-exit'" />
  </button>
</template>
