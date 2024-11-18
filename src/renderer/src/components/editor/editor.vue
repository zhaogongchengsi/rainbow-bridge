<script setup lang='ts'>
import Quill from 'quill'

const props = withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: '',
  },
)

const editor = useTemplateRef('editor')
const quillRef = shallowRef<Quill>()

watchEffect(() => {
  if (!editor.value)
    return
  quillRef.value = new Quill(editor.value, {
    placeholder: props.placeholder,
  })
})
</script>

<template>
  <div ref="editor" class="app-editor h-full overflow-auto text-base!" />
</template>
