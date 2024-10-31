import type { ConfigType } from 'dayjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function formatDate(date: ConfigType): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function dateFromNow(date: ConfigType): string {
  return dayjs(date).fromNow()
}
