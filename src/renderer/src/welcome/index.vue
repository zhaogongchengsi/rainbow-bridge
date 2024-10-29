<script setup lang="ts">
import Avatar from 'primevue/avatar'
import Theme from '@renderer/views/theme.vue'
import { isDark } from '@renderer/composables/dark'
import { useIdentity } from '@renderer/store/identity'
import { dateFromNow } from '@renderer/utils/date'
import Button from 'primevue/button'

const identity = useIdentity()

console.log(identity.identitys)
</script>

<template>
  <div class="w-full h-screen flex flex-col justify-center gap-10 items-center">
    <div class="flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold dark:text-white">Welcome rainbow bridge app!</h1>
      <p class="text-lg mt-2 dark:text-gray-500">Start file synchronization</p>
    </div>
    <div class="flex flex-col gap-6">
      <div v-if="!identity.identitys.length">
        <p class="text-lg dark:text-gray-500">No identity found</p>
      </div>
      <CardSpotlight
        v-for="identit in identity.identitys"
        v-else
        :key="identit.id"
        class="cursor-pointer"
        :gradient-color="isDark ? '#363636' : '#C9C9C9'"
        slot-class="w-100 h-25"
      >
        <div class="w-full h-full flex items-center py-2 px-4 gap-5">
          <Avatar
            :image="identit.avatar"
            :label="identit.avatar ? undefined : identit.name.at(0)"
            size="xlarge"
            shape="circle"
          />
          <div class="flex-1 min-w-0 h-full flex flex-col justify-around">
            <div class="flex items-center">
              <span class="text-sm sm:text-lg font-bold">{{ identit.name }}</span>
              <span class="text-xs text-gray-500 ml-auto">{{
                dateFromNow(identit.lastLoginTime)
              }}</span>
            </div>
            <p class="text-sm font-normal dark:text-white/60">{{ identit.comment }}</p>
          </div>
        </div>
      </CardSpotlight>
    </div>
    <div class="w-100 flex flex-col gap-4 items-center">
      <Button class="w-full" label="Create a new identity" severity="contrast" outlined />
      <Theme />
    </div>
  </div>
</template>
