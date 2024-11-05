<script setup lang="ts">
import { Bridge } from '@client/bridge'
import SystemContainer from '@renderer/views/system/system-container.vue'

onMounted(async () => {
  const id = await window.system.getID()

  console.log(import.meta.env)

  const client = new Bridge(id, {
    port: 6789,
    host: 'app.zhaozunhong.me',
    path: '/bridge',
    key: 'BnfPKyiLx3',
  })

  client.peer.on('open', () => {
    window
      .fetch('http://app.zhaozunhong.me:6789/bridge/BnfPKyiLx3/peers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        console.log(res)
        return res.json()
      })
      .then((data) => {
        console.log(data)
      })
      .catch((err) => {
        console.error(err)
      })
  })
})
</script>

<template>
  <SystemContainer>
    <router-view />
  </SystemContainer>
</template>
