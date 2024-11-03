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
      route: '/main/chat',
    },
    {
      id: 'folder',
      icon: 'pi pi-folder',
      route: '/main/folder',
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
