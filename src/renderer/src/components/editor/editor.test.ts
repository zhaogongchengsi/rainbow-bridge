import { mount } from '@vue/test-utils'
import Quill from 'quill'
import { beforeEach, describe, expect, it } from 'vitest'
import Editor from './editor.vue'

describe('editor.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(Editor, {
      props: {
        placeholder: 'Enter text here...',
      },
    })
  })

  it('should render the editor component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should initialize Quill editor with placeholder', () => {
    const quillInstance = wrapper.vm.quillRef
    expect(quillInstance).toBeInstanceOf(Quill)
    expect(quillInstance?.root.getAttribute('data-placeholder')).toBe('Enter text here...')
  })

  it('should set default textValue if no initial value is provided', () => {
    expect(wrapper.vm.textValue).toBe('')
  })

  it('should update textValue when prop changes', async () => {
    await wrapper.setProps({ text: '123' })
    expect(wrapper.vm.textValue).toBe(`123\n`)
    await wrapper.setProps({ text: '' })
    expect(wrapper.vm.textValue.trim()).toBe(`/n`)
  })
})
