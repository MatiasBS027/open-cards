import { describe, expect, it } from 'vitest'
import { shouldShowBackupReminder } from './backup'

describe('EXP-03 backup reminder', () => {
  const day = 24 * 60 * 60 * 1000
  const now = Date.parse('2026-10-14T12:00:00.000Z')

  it('hides when there are no local changes since backup', () => {
    expect(
      shouldShowBackupReminder(
        {
          lastBackupAt: '2026-01-01T00:00:00.000Z',
          hasLocalChangesSinceBackup: false,
        },
        now,
      ),
    ).toBe(false)
  })

  it('shows when there are changes and never backed up', () => {
    expect(
      shouldShowBackupReminder(
        { lastBackupAt: null, hasLocalChangesSinceBackup: true },
        now,
      ),
    ).toBe(true)
  })

  it('hides when last backup was fewer than 14 days ago', () => {
    expect(
      shouldShowBackupReminder(
        {
          lastBackupAt: new Date(now - 13 * day).toISOString(),
          hasLocalChangesSinceBackup: true,
        },
        now,
      ),
    ).toBe(false)
  })

  it('shows when last backup was 14 or more days ago with changes', () => {
    expect(
      shouldShowBackupReminder(
        {
          lastBackupAt: new Date(now - 14 * day).toISOString(),
          hasLocalChangesSinceBackup: true,
        },
        now,
      ),
    ).toBe(true)
  })
})
