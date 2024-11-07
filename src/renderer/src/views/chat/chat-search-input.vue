<script setup lang="ts">
import Menu from 'primevue/menu'

const menu = ref<InstanceType<typeof Menu> | null>(null)
const value = ref('')
const items = [
  {
    label: 'Create Group',
    icon: 'pi pi-users',
    command: () => {
      console.log('Light')
    },
  },
  {
    label: 'Add friend',
    icon: 'pi pi-user',
    command: () => {
      console.log('Dark')
    },
  },
]
function toggle(event: MouseEvent) {
  menu.value?.toggle(event)
}
</script>

<template>
  <div class="chat-left-header px-4 py-3">
    <input v-model="value" class="chat-left-header_input" placeholder="Search">
    <button class="chat-left-header_button" @click="toggle">
      <i class="pi pi-plus" />
    </button>
    <Menu ref="menu" :model="items" :popup="true" />
  </div>
</template>

<style>
  .chat-left-header {
    --chat-h: 40px;

    height: var(--chat-left-header-height);
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid var(--rainbow-border-color);

    .chat-left-header_input {
      width: calc(100% - 40px - 10px);
      height: var(--chat-h);
      outline: none;
      background-color: var(--rainbow-background-secondary);
      border: none;
      border-radius: var(--rainbow-border-radius);
      padding: 0 10px;
    }

    .chat-left-header_button {
      width: var(--chat-h);
      height: var(--chat-h);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--rainbow-border-radius);
      background-color: var(--rainbow-background-secondary);
    }
  }
</style>
