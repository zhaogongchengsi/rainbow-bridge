export interface AppAsideMenu {
  id: string
  title?: string
  icon?: string
  route?: string
  children?: AppAsideMenu[]
}

export const useAsideMenu = defineStore('app-aside-menu', () => {
  const asideMenu = ref<AppAsideMenu[]>([
    {
      id: 'chat',
      icon: 'pi pi-comment',
    },
    {
      id: 'folder',
      icon: 'pi pi-folder',
    },
  ])

  const currentMenu = useStorage<AppAsideMenu | null>('app-curren-aside-menu', null)

  const addMenu = (menu: AppAsideMenu) => {
    asideMenu.value.push(menu)
  }

  return {
    asideMenu,
    currentMenu,
    addMenu,
  }
})
