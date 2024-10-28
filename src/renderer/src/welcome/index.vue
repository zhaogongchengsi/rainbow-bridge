<script setup lang="ts">
import Theme from '@renderer/views/theme.vue'

const items = [
  {
    id: 1,
    name: 'John Doe',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '2m',
    icon: '👤',
    color: '#FFC107'
  },
  {
    id: 2,
    name: 'Jane Doe',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '5m',
    icon: '👩',
    color: '#FF5722'
  },
  {
    id: 3,
    name: 'John Smith',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '10m',
    icon: '🧑',
    color: '#3F51B5'
  }
]
const isDark = true
</script>

<template>
  <div class="w-full h-screen flex flex-col justify-center gap-10 items-center">
    <div class="flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold dark:text-white">Welcome rainbow bridge app!</h1>
      <p class="text-lg mt-2 dark:text-gray-600">Get started by editing this file</p>
    </div>
    <div class="flex flex-col gap-3">
      <CardSpotlight v-for="item in items" :key="item.id"
        class="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
        :gradient-color="isDark ? '#363636' : '#C9C9C9'">
        {{ item.name }}
      </CardSpotlight>
    </div>
    <div>
      <Theme />
    </div>
  </div>
</template>
