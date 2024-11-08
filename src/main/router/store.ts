import type { AppRouterContext } from '../libs/router'
import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { outputFile } from 'fs-extra'
import { join } from 'pathe'
import { getFileStorePath } from '../libs/store'

export async function uploadFileToStore(ctx: AppRouterContext) {
  const fromData = await ctx.readFromData()
  const data = await Promise.all(
    fromData
      .values()
      .filter(v => typeof v !== 'string')
      .map(async (file: File) => {
        const filePath = join(getFileStorePath(), file.name)
        if (existsSync(filePath)) {
          return filePath
        }
        const buffer = await file.arrayBuffer()
        await outputFile(filePath, Buffer.from(buffer))
        return filePath
      }),
  )

  ctx.sendJson(data)
}
