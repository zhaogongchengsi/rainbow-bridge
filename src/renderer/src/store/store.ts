import { useAppFetch } from '@renderer/composables/fetch'

export const useAppStore = defineStore('app-store', () => {
  const avatarPreview = ref<string>()
  const { files, open, onChange } = useFileDialog({
    accept: 'image/*', // Set to accept only image files
    directory: false,
    multiple: false
  })
  const { execute } = useAppFetch(
    'store/file/upload',
    {
      method: 'POST',
      body: files[0]
    },
    { immediate: true }
  )

  onChange((files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    console.log(file)

    avatarPreview.value = URL.createObjectURL(file)
  })

  return {
    chooseAvatar: open,
    uploadAvatar: execute,
    avatarPreview
  }
})
