<script setup lang="ts">
import type { User } from '@renderer/database/user'
import systemUpload from '@renderer/components/system/system-upload.vue'
import { isDark } from '@renderer/composables/dark'
import { useUser } from '@renderer/store/user'
import { dateFromNow } from '@renderer/utils/date'
import SystemClientState from '@renderer/views/system/system-client-state.vue'
import SystemClose from '@renderer/views/system/system-close.vue'
import SystemFullscreen from '@renderer/views/system/system-fullscreen.vue'
import Theme from '@renderer/views/system/system-theme.vue'
import SystemZoomOut from '@renderer/views/system/system-zoom-out.vue'
import { useToast } from 'primevue/usetoast'

const avatar = ref('')
const username = ref('')
const email = ref('')
const comment = ref('')
const toast = useToast()
const router = useRouter()
const visible = ref(false)
const isMacos = window.is.isMacOS
const userStore = useUser()

function onError(content: string) {
  toast.add({
    severity: 'error',
    summary: 'From Error',
    detail: content,
    life: 3000,
  })
}

function clearFrom() {
  username.value = ''
  email.value = ''
  comment.value = ''
}

function showDialog() {
  clearFrom()
  visible.value = true
}

async function onSave() {
  if (!avatar.value) {
    onError('Please upload an avatar')
    return
  }

  if (!username.value) {
    onError('Please enter a username')
    return
  }

  try {
    await userStore.createSelf({
      avatar: avatar.value,
      name: username.value,
      email: email.value,
      comment: comment.value,
    })
  }
  catch (error: any) {
    onError(error.message)
  }
  finally {
    visible.value = false
  }
}

function onIdentityClick(user: User) {
  userStore.setCurrentUser(user.id)
  router.push('/main')
}
</script>

<template>
  <div class="relative h-screen w-full flex flex-col items-center justify-center gap-10">
    <div class="draggable absolute right-0 top-0 w-full flex gap-2">
      <div class="not-draggable ml-auto flex gap-2 px-2">
        <SystemClientState class="mx-3" />
        <Theme />
        <SystemZoomOut v-if="!isMacos" />
        <SystemFullscreen v-if="!isMacos" />
        <SystemClose v-if="!isMacos" />
      </div>
    </div>
    <div class="flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold dark:text-white">
        Welcome rainbow bridge app!
      </h1>
      <p class="mt-2 text-lg dark:text-gray-500">
        Start file synchronization
      </p>
    </div>
    <div class="flex flex-col gap-6">
      <div v-if="!userStore.selfUsers.length">
        <p class="text-lg dark:text-gray-500">
          No identity found
        </p>
      </div>
      <CardSpotlight
        v-for="user in userStore.selfUsers" v-else :key="user.id" class="cursor-pointer"
        :gradient-color="isDark ? '#363636' : '#C9C9C9'" slot-class="w-100 h-25" @click="onIdentityClick(user)"
      >
        <div class="h-full w-full flex items-center gap-5 px-4 py-2">
          <Avatar
            :image="user.avatar.startsWith('file://') ? user.avatar : `file://${identit.avatar}`
            " :label="user.avatar ? undefined : user.name.at(0)" size="xlarge" shape="circle"
          />
          <div class="h-full min-w-0 flex flex-1 flex-col justify-around">
            <div class="flex items-center">
              <span class="text-sm font-bold sm:text-lg">{{ user.name }}</span>
              <span class="ml-auto text-xs text-gray-500">{{
                dateFromNow(user.lastLoginTime)
              }}</span>
            </div>
            <p class="text-sm font-normal dark:text-white/60">
              {{ user.comment }}
            </p>
          </div>
        </div>
      </CardSpotlight>
    </div>
    <div class="w-100 flex flex-col items-center gap-4">
      <Button class="w-full" label="Create a new identity" severity="contrast" outlined @click="showDialog" />
    </div>
    <Dialog v-model:visible="visible" modal header="Edit Profile" class="w-150">
      <div class="flex justify-center">
        <system-upload v-model:file="avatar" class="h-20 w-20 border rounded-full">
          <template #default="{ previewFile }">
            <Avatar v-if="previewFile" class="h-20! w-20!" :image="previewFile" size="xlarge" shape="circle" />
            <i v-else class="pi pi-upload" style="color: slateblue" />
          </template>
        </system-upload>
      </div>
      <div class="mb-4 flex flex-col gap-4">
        <label for="username" class="w-24 font-semibold">Username</label>
        <InputText id="username" v-model="username" class="flex-auto" autocomplete="off" />
      </div>
      <div class="mb-8 flex flex-col gap-4">
        <label for="email" class="w-24 font-semibold">Email</label>
        <InputText id="email" v-model="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="mb-8 flex flex-col gap-4">
        <label for="email" class="w-24 font-semibold">description</label>
        <InputText id="comment" v-model="comment" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
        <Button type="button" label="Save" @click="onSave" />
      </div>
    </Dialog>
    <Toast />
  </div>
</template>
