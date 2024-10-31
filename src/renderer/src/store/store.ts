import { useKy } from '@renderer/composables/fetch'
import isEmpty from 'lodash/isEmpty'

export const useAppStore = defineStore('app-store', () => {
  const avatarPreview = ref<string>()
  const avatarFile = shallowRef<File>()
  const { open, onChange } = useFileDialog({
    accept: 'image/*', // Set to accept only image files
    directory: false,
    multiple: false
  })

  const ky = useKy()

  onChange((files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    avatarPreview.value = URL.createObjectURL(file)
    avatarFile.value = file
  })

  function uploadStoreFiles(files: FileList | File[]) {
    if (isEmpty(files)) {
      return Promise.resolve([])
    }
    const data = new FormData()
    Array.from(files).forEach((file) => {
      data.append(file.name, file)
    })
    return ky.post<string[]>('store/file/upload', { body: data }).json()
  }

  async function uploadAvatar() {
    if (!avatarFile.value) return
    const [avatar] = await uploadStoreFiles([avatarFile.value])
    avatarPreview.value = `file://${avatar}`
    return avatar
  }

  function clearAvatar() {
    avatarPreview.value = undefined
    avatarFile.value = undefined
  }

  return {
    chooseAvatar: open,
    uploadAvatar,
    avatarPreview,
    clearAvatar
  }
})
