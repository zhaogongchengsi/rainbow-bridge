<script setup lang="ts">
import { useAsideMenu } from '@renderer/composables/aside'

const menuStore = useAsideMenu()
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
    <div class="system-aside-bar-item mt-auto">
      <button class="system-aside-bar-item-button">
        <i class="pi pi-cog" />
      </button>
    </div>
  </aside>
</template>
