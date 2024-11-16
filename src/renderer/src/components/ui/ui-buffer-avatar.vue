<script setup lang='ts'>
import { type BufferFile, bufferToUrl } from '@renderer/utils/ky'

const props = defineProps<{
  src: BufferFile
  alt?: string
  imageClass?: string
}>()

const divRef = useTemplateRef<HTMLDivElement>('divRef')

const isLoading = ref(true)
const src = computed(() => bufferToUrl(props.src))

watchEffect(async () => {
  if (!src.value)
    return
  const img = new Image()
  img.src = src.value
  img.alt = props.alt || ''
  img.className = props.imageClass || ''
  img.onload = () => {
    isLoading.value = false
    divRef.value?.appendChild(img)
  }
  img.onerror = () => {
    isLoading.value = false
  }
})
</script>

<template>
  <div ref="divRef" class="overflow-hidden rounded-full">
    <Skeleton v-if="isLoading" class="size-full!" shape="circle" />
  </div>
</template>
