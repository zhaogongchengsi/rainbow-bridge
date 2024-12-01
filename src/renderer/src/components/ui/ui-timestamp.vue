<script setup lang='ts'>
import { dateFromNow } from '@renderer/utils/date'

const props = defineProps<{
  time: string | number
}>()
</script>

<template>
  <span>{{ dateFromNow(new Date(props.time)) }}</span>
</template>
