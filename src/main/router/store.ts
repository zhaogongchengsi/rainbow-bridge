import { AppRouterContext } from '../libs/router'
import { outputFile } from 'fs-extra'
import { getFileStorePath } from '../libs/store'
import { join } from 'pathe'
import { existsSync } from 'node:fs'

export async function uploadFileToStore(ctx: AppRouterContext) {
  const fromData = await ctx.readFromData()
  return Promise.all(
    fromData
      .values()
      .filter((v) => typeof v !== 'string')
      .map(async (file: File) => {
        const filePath = join(getFileStorePath(), file.name)
        if (existsSync(filePath)) {
          return filePath
        }
        const buffer = await file.arrayBuffer()
        await outputFile(filePath, Buffer.from(buffer))
        return filePath
      })
  )
}
