<script setup lang="ts">
import type { Identity } from '@renderer/database/types/identit'
import { isDark } from '@renderer/composables/dark'
import { useIdentity } from '@renderer/store/identity'
import { useAppStore } from '@renderer/store/store'
import { dateFromNow } from '@renderer/utils/date'
import Theme from '@renderer/views/theme.vue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputText'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const username = ref('')
const email = ref('')
const comment = ref('')
const toast = useToast()
const identity = useIdentity()
const appStore = useAppStore()
const router = useRouter()
const visible = ref(false)

function onError(content: string) {
  toast.add({
    severity: 'error',
    summary: 'From Error',
    detail: content,
    life: 3000,
  })
}

function clearFrom() {
  appStore.clearAvatar()
  username.value = ''
  email.value = ''
  comment.value = ''
}

function showDialog() {
  if (!identity.canCreateIdentity()) {
    onError('You have reached the maximum number of identities')
    return
  }
  clearFrom()
  visible.value = true
}

async function onSave() {
  const avatar = await appStore.uploadAvatar()

  if (!avatar) {
    onError('Please upload an avatar')
    return
  }

  if (!username.value) {
    onError('Please enter a username')
    return
  }

  try {
    await identity.createIdentity({
      avatar,
      name: username.value,
      email: email.value,
      comment: comment.value,
    })
    await identity.reset()
  }
  catch (error: any) {
    onError(error.message)
  }
  finally {
    visible.value = false
  }
}

function onIdentitClick(identit: Identity) {
  identity.setCurrentIdentity(identit)
  router.push('/')
}
</script>

<template>
  <div class="h-screen w-full flex flex-col items-center justify-center gap-10">
    <div class="flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold dark:text-white">
        Welcome rainbow bridge app!
      </h1>
      <p class="mt-2 text-lg dark:text-gray-500">
        Start file synchronization
      </p>
    </div>
    <div class="flex flex-col gap-6">
      <div v-if="!identity.identitys.length">
        <p class="text-lg dark:text-gray-500">
          No identity found
        </p>
      </div>
      <CardSpotlight
        v-for="identit in identity.identitys" v-else :key="identit.id" class="cursor-pointer"
        :gradient-color="isDark ? '#363636' : '#C9C9C9'" slot-class="w-100 h-25"
        @click="onIdentitClick(identit)"
      >
        <div class="h-full w-full flex items-center gap-5 px-4 py-2">
          <Avatar
            :image="identit.avatar" :label="identit.avatar ? undefined : identit.name.at(0)" size="xlarge"
            shape="circle"
          />
          <div class="h-full min-w-0 flex flex-1 flex-col justify-around">
            <div class="flex items-center">
              <span class="text-sm font-bold sm:text-lg">{{ identit.name }}</span>
              <span class="ml-auto text-xs text-gray-500">{{ dateFromNow(identit.lastLoginTime) }}</span>
            </div>
            <p class="text-sm font-normal dark:text-white/60">
              {{ identit.comment }}
            </p>
          </div>
        </div>
      </CardSpotlight>
    </div>
    <div class="w-100 flex flex-col items-center gap-4">
      <Button class="w-full" label="Create a new identity" severity="contrast" outlined @click="showDialog" />
      <Theme />
    </div>
    <Dialog v-model:visible="visible" modal header="Edit Profile" class="w-150">
      <div class="flex justify-center">
        <button class="h-20 w-20 border rounded-full" @click="appStore.chooseAvatar()">
          <Avatar
            v-if="appStore.avatarPreview" class="h-20! w-20!" :image="appStore.avatarPreview" size="xlarge"
            shape="circle"
          />
          <i v-else class="pi pi-upload" style="color: slateblue" />
        </button>
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
