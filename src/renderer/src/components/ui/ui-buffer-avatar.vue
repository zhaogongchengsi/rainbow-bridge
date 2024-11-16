<script setup lang='ts'>
import { type BufferFile, bufferToUrl } from '@renderer/utils/ky'

const props = defineProps<{
  src: BufferFile
  alt?: string
}>()
const isLoading = ref(true)
const src = computed(() => bufferToUrl(props.src))
function handleLoad() {
  isLoading.value = false
}
</script>

<template>
  <div class="overflow-hidden rounded-full">
    <Skeleton shape="circle" />
    <img class="size-full rounded-full" :src="src" alt="avatar" @load="handleLoad" @error="handleLoad">
  </div>
</template>
