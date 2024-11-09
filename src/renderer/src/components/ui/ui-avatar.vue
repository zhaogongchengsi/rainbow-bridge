<script setup lang='ts'>
const props = defineProps<{
  src: string
  alt?: string
  isFile?: boolean
}>()

function isAbsoluteURL(url: string) {
  return /^(?:[a-z]+:)?\/\//i.test(url)
}

const src = computed(() => {
  const uri = props.src
  if (props.isFile) {
    return `file://${uri}`
  }
  return isAbsoluteURL(uri) ? uri : `file://${uri}`
})
</script>

<template>
  <div class="flex items-center justify-center">
    <img class="size-full overflow-hidden rounded-full object-fill" :src :alt>
  </div>
</template>
