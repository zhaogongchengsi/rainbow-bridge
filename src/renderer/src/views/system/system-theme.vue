<script setup lang="ts">
import { toggleDark } from '@renderer/composables/dark'
import Menu from 'primevue/menu'

const menu = ref<InstanceType<typeof Menu> | null>(null)
function toggle(event: MouseEvent) {
  menu.value?.toggle(event)
}

const icon = ref('pi pi-sun')

onMounted(async () => {
  const theme = await window.system.getTheme()
  if (theme === 'dark') {
    icon.value = 'pi pi-moon'
    toggleDark(true)
  }
  else if (theme === 'system') {
    icon.value = 'pi pi-cog'
  }
})

const items = [
  {
    label: 'Light',
    icon: 'pi pi-sun',
    command: () => {
      icon.value = 'pi pi-sun'
      toggleDark(false)
      window.system.setTheme('light')
    },
  },
  {
    label: 'Dark',
    icon: 'pi pi-moon',
    command: () => {
      icon.value = 'pi pi-moon'
      toggleDark(true)
      window.system.setTheme('dark')
    },
  },
  {
    label: 'System',
    icon: 'pi pi-cog',
    command: () => {
      icon.value = 'pi pi-cog'
      window.system.setTheme('system')
    },
  },
]
</script>

<template>
  <button class="system-top-button" @click="toggle">
    <i class="block" :class="icon" />
  </button>
  <Menu ref="menu" :model="items" :popup="true" />
</template>
