<script setup lang="ts">
import { invoke } from '@renderer/utils/ipc'

function onMinimize() {
  invoke('app:minimize')
}
</script>

<template>
  <button class="system-top-button" @click="onMinimize">
    <i class="i-ic-baseline-horizontal-rule block" />
  </button>
</template>
