<script setup lang='ts'>
import { type BufferFile, bufferToUrl } from '@renderer/utils/ky'

const props = defineProps<{
  src: BufferFile
  alt?: string
}>()

const src = computed(() => bufferToUrl(props.src))
</script>

<template>
  <img :src="src" alt="avatar" class="rounded-full">
</template>
