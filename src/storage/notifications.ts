import { createId, nowIso } from '../domain/ids'
import type { AppNotification } from '../domain/types'
import { db, ensureSettings } from './db'

export async function listNotifications(): Promise<AppNotification[]> {
  const settings = await ensureSettings()
  return [...(settings.notifications ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function unreadNotificationCount(): Promise<number> {
  const list = await listNotifications()
  return list.filter((n) => !n.read).length
}

export async function pushNotification(
  input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & {
    id?: string
  },
): Promise<void> {
  const settings = await ensureSettings()
  const list = settings.notifications ?? []
  if (input.id && list.some((n) => n.id === input.id)) return
  const next: AppNotification = {
    id: input.id ?? createId(),
    title: input.title,
    body: input.body,
    kind: input.kind,
    createdAt: nowIso(),
    read: false,
  }
  await db.settings.update('app', {
    notifications: [next, ...list].slice(0, 50),
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  const settings = await ensureSettings()
  const list = (settings.notifications ?? []).map((n) =>
    n.id === id ? { ...n, read: true } : n,
  )
  await db.settings.update('app', { notifications: list })
}

export async function markAllNotificationsRead(): Promise<void> {
  const settings = await ensureSettings()
  const list = (settings.notifications ?? []).map((n) => ({ ...n, read: true }))
  await db.settings.update('app', { notifications: list })
}

export async function clearNotifications(): Promise<void> {
  await ensureSettings()
  await db.settings.update('app', { notifications: [] })
}
