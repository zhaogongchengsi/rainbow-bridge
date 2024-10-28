<script setup lang="ts">
import Avatar from 'primevue/avatar'
import Theme from '@renderer/views/theme.vue'
import { isDark } from '@renderer/composables/dark'
import { useIdentity } from '@renderer/store/identity'
import { Identity } from '@renderer/database/types/identit'

const identity = useIdentity()

console.log(identity.identitys)

const items: Identity[] = [
  {
    id: 1,
    name: 'John Doe',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    lastLoginTime: Date.now(),
    avatar: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  },
  {
    id: 2,
    name: 'Jane Doe',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    lastLoginTime: Date.now(),
    avatar: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  },
  {
    id: 3,
    name: 'John Smith',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    lastLoginTime: Date.now(),
    avatar: 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
  }
]
</script>

<template>
  <div class="w-full h-screen flex flex-col justify-center gap-10 items-center">
    <div class="flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold dark:text-white">Welcome rainbow bridge app!</h1>
      <p class="text-lg mt-2 dark:text-gray-600">Get started by editing this file</p>
    </div>
    <div class="flex flex-col gap-6">
      <CardSpotlight
        v-for="identit in items"
        :key="identit.id"
        class="cursor-pointer"
        :gradient-color="isDark ? '#363636' : '#C9C9C9'"
        slot-class="w-130 h-35"
      >
        <div class="w-full h-full flex items-center py-2 px-4 gap-5">
          <Avatar
            :image="identit.avatar"
            :label="identit.avatar ? undefined : identit.name.at(0)"
            size="xlarge"
            shape="circle"
          />
          <div class="flex-1 min-w-0 h-full flex flex-col justify-around">
            <span class="text-2xl font-bold">{{ identit.name }}</span>
            <p class="text-lg">{{ identit.comment }}</p>
            <span class="text-sm">{{ identit.lastLoginTime }}</span>
          </div>
        </div>
      </CardSpotlight>
    </div>
    <div>
      <Theme />
    </div>
  </div>
</template>
