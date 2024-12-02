<script setup lang="ts">
import Avatar from '@renderer/components/ui/ui-avatar.vue'
import { useAsideMenu } from '@renderer/composables/aside'
import { useUser } from '@renderer/store/user'
import { getClientID } from '@renderer/utils/id'
import { debounce } from 'perfect-debounce'
import Menu from 'primevue/menu'

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

function toggle(event: MouseEvent) {
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
    <div v-if="userStore.currentUser" class="system-aside-footer flex items-center justify-center">
      <button aria-haspopup="true" aria-controls="overlay_menu" @click="toggle">
        <Avatar
          :src="userStore.currentUser?.avatar" class="size-10 cursor-pointer" :name="userStore.currentUser?.name"
        />
      </button>
      <Menu id="overlay_menu" ref="menuRef" :model="items" :popup="true">
        <template #start>
          <div class="flex items-center justify-between gap-2 px-2 py-1">
            <span>ID:</span>
            <span class="block max-w-35 min-w-0 flex-1 truncate text-sm">{{ id }}</span>
            <button class="ml-2" @click="onCopy">
              <i class="pi" :class="[copied ? 'pi-check' : 'pi-copy']" />
            </button>
          </div>
        </template>
      </Menu>
    </div>
    <Divider />
    <ul class="system-aside-bar-list">
      <li v-for="menuItem of menuStore.asideMenu" :key="menuItem.id" class="system-aside-bar-item">
        <component
          v-bind="{
            to: menuItem.route ? menuItem.route : undefined,
            class: ['system-aside-bar-item-button', { 'system-aside-bar-item-button-link': menuItem.route, 'system-aside-bar-item-button-active': menuStore.currentMenu && (menuItem.id === menuStore.currentMenu.id) }],
          }" :is="menuItem.route ? 'router-link' : 'button'" class="system-aside-bar-item-button"
        >
          <i v-if="menuItem.icon" :class="menuItem.icon" />
          <span v-else>{{ menuItem.title }}</span>
        </component>
      </li>
    </ul>
  </aside>
</template>
