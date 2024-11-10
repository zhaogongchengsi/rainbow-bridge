<script setup lang='ts'>
import { uploadFilesToStore } from '@renderer/utils/ky'
import { logger } from '@renderer/utils/logger'

const props = withDefaults(
  defineProps<{
    tag?: string
    accept?: string
    directory?: boolean
    multiple?: boolean
    autoUpload?: boolean
  }>(),
  {
    tag: 'button',
    accept: 'image/*',
    directory: false,
    multiple: false,
    autoUpload: true,
  },
)

const loading = defineModel('loading', { default: false })
const previewFiles = shallowRef<string[]>([])
const previewFile = shallowRef<string>()

const filesValue = defineModel<string[]>('files')
const fileValue = defineModel<string>('file')

const { open, onChange, files, reset } = useFileDialog({
  accept: props.accept,
  directory: props.directory,
  multiple: props.multiple,
})

onChange((files: FileList | null) => {
  if (!files || files.length === 0)
    return

  const previews = Array.from(files).map(file => URL.createObjectURL(file))
  previewFiles.value = previews
  previewFile.value = previews[0]
})

async function upload(files: FileList | File[]) {
  loading.value = true
  try {
    const filePath = await uploadFilesToStore(files)
    filesValue.value = filePath
    fileValue.value = filePath[0]
  }
  catch (err: any) {
    console.error(err)
    logger.error(`Failed to upload files: ${err.message}`)
  }
  finally {
    loading.value = false
  }
}

onChange(() => {
  if (props.autoUpload && files.value)
    upload(files.value)
})
</script>

<template>
  <component :is="tag" @click="open">
    <slot :preview-files="previewFiles" :loading name="files" :open="open" :reset="reset" :files :upload="upload" />
    <slot
      :preview-file="previewFile" :loading :open="open" :reset="reset" :file="files ? files.item(0) : null"
      :upload="upload"
    />
  </component>
</template>
