<script setup lang="ts">
import Avatar from '@renderer/components/ui/ui-avatar.vue'
import { useAsideMenu } from '@renderer/composables/aside'
import { useUser } from '@renderer/store/user'
import { getClientID } from '@renderer/utils/id'
import { debounce } from 'perfect-debounce'

const menuStore = useAsideMenu()
const userStore = useUser()
const router = useRouter()

const menuRef = ref()
const copied = ref(false)

const id = ref('')

onMounted(async () => {
  id.value = await getClientID()
})

const onCopy = debounce(() => {
  navigator.clipboard.writeText(id.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1000)
}, 300)

function toggle(event) {
  menuRef.value.toggle(event)
}

const items = [
  {
    label: 'Settings',
    icon: 'pi pi-cog',
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      router.push('/')
    },
  },
]
</script>

<template>
  <aside class="system-aside-bar">
    <ul class="system-aside-bar-list">
      <li v-for="menu of menuStore.asideMenu" :key="menu.id" class="system-aside-bar-item">
        <component
          v-bind="{
            to: menu.route ? menu.route : undefined,
            class: ['system-aside-bar-item-button', { 'system-aside-bar-item-button-link': menu.route, 'system-aside-bar-item-button-active': menuStore.currentMenu && (menu.id === menuStore.currentMenu.id) }],
          }" :is="menu.route ? 'router-link' : 'button'" class="system-aside-bar-item-button"
        >
          <i v-if="menu.icon" :class="menu.icon" />
          <span v-else>{{ menu.title }}</span>
        </component>
      </li>
    </ul>
    <div class="system-aside-footer mt-auto flex flex-col items-center justify-center gap-5">
      <VDropdown
        v-if="userStore.currentUser" :arrow-padding="0" :triggers="['click']" placement="right" :distance="6"
        theme="app-menu"
      >
        <button class="system-aside-bar-item-button">
          <i class="pi pi-user" />
        </button>
        <template #popper>
          <div class="w-60 p-2">
            <div class="w-full flex gap-2">
              <Avatar
                v-if="userStore.currentUser.avatar" :src="userStore.currentUser.avatar"
                class="size-[var(--system-aside-bar-item-button-size)] cursor-pointer"
              />
              <div class="min-w-0 flex flex-1 flex-col justify-between">
                <span class="text-sm font-bold">{{ userStore.currentUser.name }}</span>
                <span class="text-xs text-gray-500">{{ userStore.currentUser.lastLoginTime }}</span>
              </div>
            </div>
            <Divider />
            <div class="flex items-center justify-between">
              <span>ID:</span>
              <p class="max-w-40 truncate" :title="id">
                {{ id }}
              </p>
              <i :class="{ 'pi-copy': !copied, 'pi-check': copied }" class="pi cursor-pointer" @click="onCopy" />
            </div>
          </div>
        </template>
      </VDropdown>
      <button class="system-aside-bar-item-button" @click="toggle">
        <i class="pi pi-cog" />
      </button>
      <Menu ref="menuRef" :model="items" :popup="true" />
    </div>
  </aside>
</template>
