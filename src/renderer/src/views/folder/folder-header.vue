<script setup lang='ts'>
import uiButton from '@renderer/components/ui/ui-button.vue'

const visible = ref(false)

const home = ref({
  icon: 'pi pi-home',
  label: 'home',
})

const items = ref([
  { label: 'Components' },
  { label: 'Form' },
  { label: 'InputText' },
])
</script>

<template>
  <div class="h-12 w-full px-2">
    <div class="size-full flex items-center">
      <div class="flex gap-3">
        <ui-button>
          <span class="pi pi-angle-left" />
        </ui-button>
        <ui-button>
          <span class="pi pi-angle-right" />
        </ui-button>
        <ui-button @click="visible = true">
          <span class="pi pi-plus" />
        </ui-button>
        <ui-button>
          <span class="pi pi-refresh" />
        </ui-button>
      </div>
      <Divider layout="vertical" />
      <div class="h-full min-w-0 flex flex-1 items-center">
        <Breadcrumb :home="home" :model="items" class="p-1!">
          <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a :href="href" v-bind="props.action" @click="navigate">
                <span :class="[item.icon]" />
                <span class="text-primary font-semibold">{{ item.label }}</span>
              </a>
            </router-link>
            <a v-else :href="item.url" :target="item.target" v-bind="props.action">
              <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
            </a>
          </template>
        </Breadcrumb>
      </div>
      <Divider layout="vertical" />
      <div class="folder-header-search-wrapper">
        <span class="pi pi-search size-5" />
        <input class="folder-header-search-input" placeholder="Search">
      </div>
    </div>

    <Dialog v-model:visible="visible" modal header="Edit Profile" class="w-100">
      <span class="text-surface-500 dark:text-surface-400 mb-8 block">Update your information.</span>
      <div class="mb-4 flex items-center gap-4">
        <label for="username" class="w-24 font-semibold">Username</label>
        <InputText id="username" class="flex-auto" autocomplete="off" />
      </div>
      <div class="mb-8 flex items-center gap-4">
        <label for="email" class="w-24 font-semibold">Email</label>
        <InputText id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false" />
        <Button type="button" label="Save" @click="visible = false" />
      </div>
    </Dialog>
  </div>
</template>

<style>
  .folder-header-search-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    width: 450px;
  }

  .folder-header-search-input {
    height: 100%;
    width: 100%;
    border: none;
    background-color: transparent !important;
    color: var(--text-color);
    outline: none;
  }

  .folder-header-search-wrapper:focus-within {
    outline: none;
  }
</style>
