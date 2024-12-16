interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

/**
 * 将文件路径数组生成树形结构
 * @param files - 文件路径数组
 * @returns 返回文件树的根节点
 */
/**
 * Generates a file tree structure from an array of file paths.
 *
 * @param files - An array of file paths as strings.
 * @returns A FileNode representing the root of the generated file tree.
 *
 * @example
 * ```typescript
 * const files = [
 *   'src/index.ts',
 *   'src/utils/fileTree.ts',
 *   'src/components/App.tsx',
 * ];
 * const fileTree = generateFileTree(files);
 * console.log(fileTree);
 * ```
 */
export function generateFileTree(files: string[]): FileNode {
  const root: FileNode = {
    name: '',
    path: '',
    children: [],
  }

  const fileMap: { [key: string]: FileNode } = {}

  files.forEach((file) => {
    const parts = file.split('/')
    let currentNode = root

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join('/')
      if (!fileMap[currentPath]) {
        const newNode: FileNode = {
          name: part,
          path: currentPath,
          children: [],
        }
        fileMap[currentPath] = newNode
        currentNode.children!.push(newNode)
      }
      currentNode = fileMap[currentPath]
    })
  })

  return root
}
