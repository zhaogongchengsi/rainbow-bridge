<script setup lang="ts">
import SystemAside from '@renderer/views/system/system-aside.vue'
import SystemTabbar from '@renderer/views/system/system-tabbar.vue'
</script>

<template>
  <section class="system-container">
    <SystemTabbar />
    <section class="system-container-box">
      <SystemAside />
      <main class="system-main">
        <slot />
      </main>
    </section>
  </section>
</template>
