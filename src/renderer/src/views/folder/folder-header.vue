<script setup lang='ts'>
import { zodResolver } from '@primevue/forms/resolvers/zod'
import uiButton from '@renderer/components/ui/ui-button.vue'
import { z } from 'zod'

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

const initialValues = ref({
  username: '',
})

function onFormSubmit({ valid }) {
  console.log('Form submitted', valid)
}

const resolver = zodResolver(
  z.object({
    username: z.string().min(1, { message: 'Username is required via Zod.' }),
  }),
)
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

    <Dialog v-model:visible="visible" modal header="Edit Profile" class="w-150">
      <Form class="w-full flex flex-col gap-3 py-2" :initial-values :resolver @submit="onFormSubmit">
        <FormField v-slot="$field" name="user" initial-value="" class="flex flex-col gap-1">
          <InputText type="text" placeholder="user" />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
        <FormField v-slot="$field" name="root" initial-value="" class="flex flex-col gap-1">
          <InputText type="text" placeholder="root" />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
        <FormField v-slot="$field" name="ignore" initial-value="" class="flex flex-col gap-1">
          <Textarea rows="5" cols="30" auto-resize type="text" placeholder="ignore" />
          <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
      </Form>
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
