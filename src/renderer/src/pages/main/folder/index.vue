<script setup lang='ts'>
import folderHeader from '@renderer/views/folder/folder-header.vue'
</script>

<template>
  <div class="size-full flex flex-col">
    <folder-header />
    <Divider class="my-0!" />
    <div class="min-h-0 w-full flex-1 overflow-auto">
      <RouterView />
    </div>
  </div>
</template>
