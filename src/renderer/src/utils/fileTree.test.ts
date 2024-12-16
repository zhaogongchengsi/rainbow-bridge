import { describe, expect, it } from 'vitest'
import { generateFileTree } from './fileTree'

describe('generateFileTree', () => {
  it('should generate a file tree with a single file', () => {
    const files = ['src/index.ts']
    const fileTree = generateFileTree(files)

    expect(fileTree).to.deep.equal({
      name: '',
      path: '',
      children: [
        {
          name: 'src',
          path: 'src',
          children: [
            {
              name: 'index.ts',
              path: 'src/index.ts',
              children: [],
            },
          ],
        },
      ],
    })
  })

  it('should generate a file tree with multiple files in the same directory', () => {
    const files = ['src/index.ts', 'src/utils/fileTree.ts']
    const fileTree = generateFileTree(files)

    expect(fileTree).to.deep.equal({
      name: '',
      path: '',
      children: [
        {
          name: 'src',
          path: 'src',
          children: [
            {
              name: 'index.ts',
              path: 'src/index.ts',
              children: [],
            },
            {
              name: 'utils',
              path: 'src/utils',
              children: [
                {
                  name: 'fileTree.ts',
                  path: 'src/utils/fileTree.ts',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('should generate a file tree with nested directories', () => {
    const files = ['src/index.ts', 'src/utils/fileTree.ts', 'src/components/App.tsx']
    const fileTree = generateFileTree(files)

    expect(fileTree).to.deep.equal({
      name: '',
      path: '',
      children: [
        {
          name: 'src',
          path: 'src',
          children: [
            {
              name: 'index.ts',
              path: 'src/index.ts',
              children: [],
            },
            {
              name: 'utils',
              path: 'src/utils',
              children: [
                {
                  name: 'fileTree.ts',
                  path: 'src/utils/fileTree.ts',
                  children: [],
                },
              ],
            },
            {
              name: 'components',
              path: 'src/components',
              children: [
                {
                  name: 'App.tsx',
                  path: 'src/components/App.tsx',
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('should handle an empty array of files', () => {
    const files: string[] = []
    const fileTree = generateFileTree(files)

    expect(fileTree).to.deep.equal({
      name: '',
      path: '',
      children: [],
    })
  })

  it('high strength', () => {
    const files = [
      'main.ts',
      'env.d.ts',
      'constants.ts',
      'App.vue',
      'utils/object.ts',
      'utils/object.test.ts',
      'utils/logger.ts',
      'utils/ky.ts',
      'utils/ipc.ts',
      'utils/id.ts',
      'utils/decrypt.ts',
      'utils/decrypt.test.ts',
      'utils/date.ts',
      'utils/async.ts',
      'theme/index.ts',
      'styles/scrollbar.css',
      'styles/config.css',
      'styles/base.css',
      'store/user.ts',
      'store/chat.ts',
      'pages/main.vue',
      'pages/index.vue',
      'database/user.ts',
      'database/type.ts',
      'database/message.ts',
      'database/folder.ts',
      'database/enums.ts',
      'database/chat.ts',
      'database/base.ts',
      'composables/fetch.ts',
      'composables/define.ts',
      'composables/dark.ts',
      'composables/aside.ts',
      'client/use.ts',
      'client/type.ts',
      'client/plugin.ts',
      'client/manager.ts',
      'client/event.ts',
      'client/enums.ts',
      'client/constant.ts',
      'client/connect.ts',
      'client/client.ts',
      'views/system/system-zoom-out.vue',
      'views/system/system-topbar-left.vue',
      'views/system/system-theme.vue',
      'views/system/system-tabbar.vue',
      'views/system/system-fullscreen.vue',
      'views/system/system-container.vue',
      'views/system/system-close.vue',
      'views/system/system-client-state.vue',
      'views/system/system-aside.vue',
      'views/folder/folder-header.vue',
      'views/chat/search.vue',
      'views/chat/chat-search-input.vue',
      'views/chat/chat-message-main.vue',
      'views/chat/chat-message-item.vue',
      'views/chat/chat-list.vue',
      'theme/preset/dialog.ts',
      'pages/main/index.vue',
      'pages/main/folder.vue',
      'pages/main/chat.vue',
      'components/ui/ui-timestamp.vue',
      'components/ui/ui-button.vue',
      'components/ui/ui-buffer-avatar.vue',
      'components/ui/ui-avatar.vue',
      'components/ui/card-spotlight.vue',
      'components/system/system-upload.vue',
      'components/editor/index.ts',
      'components/editor/editor.vue',
      'components/editor/editor.test.ts',
      'pages/main/folder/index.vue',
      'pages/main/chat/index.vue',
      'pages/main/folder/[path]/index.vue',
      'pages/main/chat/[id]/index.vue',
    ]
    const fileTree = generateFileTree(files)
    expect(fileTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [],
            "name": "main.ts",
            "path": "main.ts",
          },
          {
            "children": [],
            "name": "env.d.ts",
            "path": "env.d.ts",
          },
          {
            "children": [],
            "name": "constants.ts",
            "path": "constants.ts",
          },
          {
            "children": [],
            "name": "App.vue",
            "path": "App.vue",
          },
          {
            "children": [
              {
                "children": [],
                "name": "object.ts",
                "path": "utils/object.ts",
              },
              {
                "children": [],
                "name": "object.test.ts",
                "path": "utils/object.test.ts",
              },
              {
                "children": [],
                "name": "logger.ts",
                "path": "utils/logger.ts",
              },
              {
                "children": [],
                "name": "ky.ts",
                "path": "utils/ky.ts",
              },
              {
                "children": [],
                "name": "ipc.ts",
                "path": "utils/ipc.ts",
              },
              {
                "children": [],
                "name": "id.ts",
                "path": "utils/id.ts",
              },
              {
                "children": [],
                "name": "decrypt.ts",
                "path": "utils/decrypt.ts",
              },
              {
                "children": [],
                "name": "decrypt.test.ts",
                "path": "utils/decrypt.test.ts",
              },
              {
                "children": [],
                "name": "date.ts",
                "path": "utils/date.ts",
              },
              {
                "children": [],
                "name": "async.ts",
                "path": "utils/async.ts",
              },
            ],
            "name": "utils",
            "path": "utils",
          },
          {
            "children": [
              {
                "children": [],
                "name": "index.ts",
                "path": "theme/index.ts",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "dialog.ts",
                    "path": "theme/preset/dialog.ts",
                  },
                ],
                "name": "preset",
                "path": "theme/preset",
              },
            ],
            "name": "theme",
            "path": "theme",
          },
          {
            "children": [
              {
                "children": [],
                "name": "scrollbar.css",
                "path": "styles/scrollbar.css",
              },
              {
                "children": [],
                "name": "config.css",
                "path": "styles/config.css",
              },
              {
                "children": [],
                "name": "base.css",
                "path": "styles/base.css",
              },
            ],
            "name": "styles",
            "path": "styles",
          },
          {
            "children": [
              {
                "children": [],
                "name": "user.ts",
                "path": "store/user.ts",
              },
              {
                "children": [],
                "name": "chat.ts",
                "path": "store/chat.ts",
              },
            ],
            "name": "store",
            "path": "store",
          },
          {
            "children": [
              {
                "children": [],
                "name": "main.vue",
                "path": "pages/main.vue",
              },
              {
                "children": [],
                "name": "index.vue",
                "path": "pages/index.vue",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "index.vue",
                    "path": "pages/main/index.vue",
                  },
                  {
                    "children": [],
                    "name": "folder.vue",
                    "path": "pages/main/folder.vue",
                  },
                  {
                    "children": [],
                    "name": "chat.vue",
                    "path": "pages/main/chat.vue",
                  },
                  {
                    "children": [
                      {
                        "children": [],
                        "name": "index.vue",
                        "path": "pages/main/folder/index.vue",
                      },
                      {
                        "children": [
                          {
                            "children": [],
                            "name": "index.vue",
                            "path": "pages/main/folder/[path]/index.vue",
                          },
                        ],
                        "name": "[path]",
                        "path": "pages/main/folder/[path]",
                      },
                    ],
                    "name": "folder",
                    "path": "pages/main/folder",
                  },
                  {
                    "children": [
                      {
                        "children": [],
                        "name": "index.vue",
                        "path": "pages/main/chat/index.vue",
                      },
                      {
                        "children": [
                          {
                            "children": [],
                            "name": "index.vue",
                            "path": "pages/main/chat/[id]/index.vue",
                          },
                        ],
                        "name": "[id]",
                        "path": "pages/main/chat/[id]",
                      },
                    ],
                    "name": "chat",
                    "path": "pages/main/chat",
                  },
                ],
                "name": "main",
                "path": "pages/main",
              },
            ],
            "name": "pages",
            "path": "pages",
          },
          {
            "children": [
              {
                "children": [],
                "name": "user.ts",
                "path": "database/user.ts",
              },
              {
                "children": [],
                "name": "type.ts",
                "path": "database/type.ts",
              },
              {
                "children": [],
                "name": "message.ts",
                "path": "database/message.ts",
              },
              {
                "children": [],
                "name": "folder.ts",
                "path": "database/folder.ts",
              },
              {
                "children": [],
                "name": "enums.ts",
                "path": "database/enums.ts",
              },
              {
                "children": [],
                "name": "chat.ts",
                "path": "database/chat.ts",
              },
              {
                "children": [],
                "name": "base.ts",
                "path": "database/base.ts",
              },
            ],
            "name": "database",
            "path": "database",
          },
          {
            "children": [
              {
                "children": [],
                "name": "fetch.ts",
                "path": "composables/fetch.ts",
              },
              {
                "children": [],
                "name": "define.ts",
                "path": "composables/define.ts",
              },
              {
                "children": [],
                "name": "dark.ts",
                "path": "composables/dark.ts",
              },
              {
                "children": [],
                "name": "aside.ts",
                "path": "composables/aside.ts",
              },
            ],
            "name": "composables",
            "path": "composables",
          },
          {
            "children": [
              {
                "children": [],
                "name": "use.ts",
                "path": "client/use.ts",
              },
              {
                "children": [],
                "name": "type.ts",
                "path": "client/type.ts",
              },
              {
                "children": [],
                "name": "plugin.ts",
                "path": "client/plugin.ts",
              },
              {
                "children": [],
                "name": "manager.ts",
                "path": "client/manager.ts",
              },
              {
                "children": [],
                "name": "event.ts",
                "path": "client/event.ts",
              },
              {
                "children": [],
                "name": "enums.ts",
                "path": "client/enums.ts",
              },
              {
                "children": [],
                "name": "constant.ts",
                "path": "client/constant.ts",
              },
              {
                "children": [],
                "name": "connect.ts",
                "path": "client/connect.ts",
              },
              {
                "children": [],
                "name": "client.ts",
                "path": "client/client.ts",
              },
            ],
            "name": "client",
            "path": "client",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "name": "system-zoom-out.vue",
                    "path": "views/system/system-zoom-out.vue",
                  },
                  {
                    "children": [],
                    "name": "system-topbar-left.vue",
                    "path": "views/system/system-topbar-left.vue",
                  },
                  {
                    "children": [],
                    "name": "system-theme.vue",
                    "path": "views/system/system-theme.vue",
                  },
                  {
                    "children": [],
                    "name": "system-tabbar.vue",
                    "path": "views/system/system-tabbar.vue",
                  },
                  {
                    "children": [],
                    "name": "system-fullscreen.vue",
                    "path": "views/system/system-fullscreen.vue",
                  },
                  {
                    "children": [],
                    "name": "system-container.vue",
                    "path": "views/system/system-container.vue",
                  },
                  {
                    "children": [],
                    "name": "system-close.vue",
                    "path": "views/system/system-close.vue",
                  },
                  {
                    "children": [],
                    "name": "system-client-state.vue",
                    "path": "views/system/system-client-state.vue",
                  },
                  {
                    "children": [],
                    "name": "system-aside.vue",
                    "path": "views/system/system-aside.vue",
                  },
                ],
                "name": "system",
                "path": "views/system",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "folder-header.vue",
                    "path": "views/folder/folder-header.vue",
                  },
                ],
                "name": "folder",
                "path": "views/folder",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "search.vue",
                    "path": "views/chat/search.vue",
                  },
                  {
                    "children": [],
                    "name": "chat-search-input.vue",
                    "path": "views/chat/chat-search-input.vue",
                  },
                  {
                    "children": [],
                    "name": "chat-message-main.vue",
                    "path": "views/chat/chat-message-main.vue",
                  },
                  {
                    "children": [],
                    "name": "chat-message-item.vue",
                    "path": "views/chat/chat-message-item.vue",
                  },
                  {
                    "children": [],
                    "name": "chat-list.vue",
                    "path": "views/chat/chat-list.vue",
                  },
                ],
                "name": "chat",
                "path": "views/chat",
              },
            ],
            "name": "views",
            "path": "views",
          },
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "name": "ui-timestamp.vue",
                    "path": "components/ui/ui-timestamp.vue",
                  },
                  {
                    "children": [],
                    "name": "ui-button.vue",
                    "path": "components/ui/ui-button.vue",
                  },
                  {
                    "children": [],
                    "name": "ui-buffer-avatar.vue",
                    "path": "components/ui/ui-buffer-avatar.vue",
                  },
                  {
                    "children": [],
                    "name": "ui-avatar.vue",
                    "path": "components/ui/ui-avatar.vue",
                  },
                  {
                    "children": [],
                    "name": "card-spotlight.vue",
                    "path": "components/ui/card-spotlight.vue",
                  },
                ],
                "name": "ui",
                "path": "components/ui",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "system-upload.vue",
                    "path": "components/system/system-upload.vue",
                  },
                ],
                "name": "system",
                "path": "components/system",
              },
              {
                "children": [
                  {
                    "children": [],
                    "name": "index.ts",
                    "path": "components/editor/index.ts",
                  },
                  {
                    "children": [],
                    "name": "editor.vue",
                    "path": "components/editor/editor.vue",
                  },
                  {
                    "children": [],
                    "name": "editor.test.ts",
                    "path": "components/editor/editor.test.ts",
                  },
                ],
                "name": "editor",
                "path": "components/editor",
              },
            ],
            "name": "components",
            "path": "components",
          },
        ],
        "name": "",
        "path": "",
      }
    `)
  })
})
