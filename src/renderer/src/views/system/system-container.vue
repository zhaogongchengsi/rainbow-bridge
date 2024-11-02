<script setup lang="ts">
import SystemTabbar from '@renderer/views/system/system-tabbar.vue'
</script>

<template>
  <section class="system-container">
    <SystemTabbar />
    <section class="system-container-box">
      <aside class="system-aside-bar">
        aside
      </aside>
      <main class="system-main">
        <slot />
      </main>
    </section>
  </section>
</template>
