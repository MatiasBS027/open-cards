import { BACKUP_REMINDER_DAYS } from '../config'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** EXP-03: remind after N days with unsaved-to-export changes. */
export function shouldShowBackupReminder(
  settings: {
    lastBackupAt: string | null
    hasLocalChangesSinceBackup: boolean
  },
  nowMs: number = Date.now(),
  reminderDays: number = BACKUP_REMINDER_DAYS,
): boolean {
  if (!settings.hasLocalChangesSinceBackup) return false
  if (!settings.lastBackupAt) return true
  const last = Date.parse(settings.lastBackupAt)
  if (Number.isNaN(last)) return true
  return nowMs - last >= reminderDays * MS_PER_DAY
}
