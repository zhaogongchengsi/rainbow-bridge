import { nativeTheme } from 'electron'
import { defineHandle } from '../libs/define'
import { set, get } from '../libs/store'

export const setTheme = defineHandle(async (newTheme: 'light' | 'dark' | 'system') => {
  nativeTheme.themeSource = newTheme
  return await set('theme', newTheme)
})

export const getTheme = defineHandle(() => {
  return get('theme')
})
