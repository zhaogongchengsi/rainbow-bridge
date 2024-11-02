<script setup lang="ts">
import { invoke } from '@renderer/utils/ipc'
import { logger } from '@renderer/utils/logger'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()

const prompt = useStorage('can-close-prompt', true)

function exitApplication() {
  logger.info('Exiting application')
  invoke('app:exit')
}

function onClose() {
  if (prompt.value) {
    exitApplication()
    return
  }
  confirm.require({
    group: 'templating',
    icon: 'i-ic-outline-close',
    header: 'Confirm exit',
    message: 'Not asking',
    accept: exitApplication,
  })
}
</script>

<template>
  <button class="system-top-button system-top-button-danger" @click="onClose">
    <i class="i-ic-outline-close block" />
  </button>
  <ConfirmDialog group="templating">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="w-100 pt-4">
        <div class="flex items-center gap-3 px-5 pb-2">
          <i class="i-ic-round-warning-amber block size-6" />
          <div class="text-center">
            {{ message.header }}
          </div>
        </div>
        <div class="flex items-center px-5 py-3">
          <Checkbox v-model="prompt" :binary="true" />
          <label for="ingredient1" class="ml-2"> {{ message.message }} </label>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 px-2 pb-4">
        <Button label="Cancel" severity="secondary" outlined @click="rejectCallback" />
        <Button label="Exit" severity="danger" outlined @click="acceptCallback" />
      </div>
    </template>
  </ConfirmDialog>
</template>
