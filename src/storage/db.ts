import Dexie, { type Table } from 'dexie'
import type {
  Card,
  Deck,
  DeckTag,
  Settings,
  StudySession,
  Tag,
} from '../domain/types'

export class OpenCardsDB extends Dexie {
  decks!: Table<Deck, string>
  cards!: Table<Card, string>
  tags!: Table<Tag, string>
  deckTags!: Table<DeckTag, [string, string]>
  studySessions!: Table<StudySession, string>
  settings!: Table<Settings, string>

  constructor() {
    super('open-cards')
    this.version(1).stores({
      decks: 'id, name, updatedAt',
      cards: 'id, deckId, position, state, [deckId+position]',
      tags: 'id, normalizedName',
      deckTags: '[deckId+tagId], deckId, tagId',
      studySessions: 'id, deckId',
      settings: 'id',
    })
  }
}

export const db = new OpenCardsDB()

export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get('app')
  if (existing) {
    const normalized: Settings = {
      ...existing,
      notifications: existing.notifications ?? [],
      profileName: existing.profileName ?? '',
      profileAvatarDataUrl: existing.profileAvatarDataUrl ?? null,
      dismissedUpdateVersion: existing.dismissedUpdateVersion ?? null,
    }
    if (
      !existing.notifications ||
      existing.profileName === undefined ||
      existing.profileAvatarDataUrl === undefined ||
      existing.dismissedUpdateVersion === undefined
    ) {
      await db.settings.put(normalized)
    }
    return normalized
  }
  const defaults: Settings = {
    id: 'app',
    theme: 'system',
    lastBackupAt: null,
    hasLocalChangesSinceBackup: false,
    storagePersistAsked: false,
    notifications: [],
    profileName: '',
    profileAvatarDataUrl: null,
    dismissedUpdateVersion: null,
  }
  await db.settings.put(defaults)
  return defaults
}

export async function updateProfile(patch: {
  profileName?: string
  profileAvatarDataUrl?: string | null
}): Promise<Settings> {
  await ensureSettings()
  await db.settings.update('app', patch)
  return ensureSettings()
}

export async function dismissUpdateVersion(version: string): Promise<Settings> {
  await ensureSettings()
  await db.settings.update('app', { dismissedUpdateVersion: version })
  return ensureSettings()
}

export async function markLocalChange(): Promise<void> {
  const settings = await ensureSettings()
  if (!settings.hasLocalChangesSinceBackup) {
    await db.settings.update('app', { hasLocalChangesSinceBackup: true })
  }
}

export async function markBackupDone(): Promise<void> {
  await ensureSettings()
  await db.settings.update('app', {
    lastBackupAt: new Date().toISOString(),
    hasLocalChangesSinceBackup: false,
  })
}
