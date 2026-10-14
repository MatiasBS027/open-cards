export type CardState = 'unseen' | 'seen' | 'understood' | 'needs_review'

export type TextBlock = { type: 'text'; content: string }
export type MathBlock = { type: 'math'; content: string }
export type CodeBlock = { type: 'code'; language: string; content: string }
export type Block = TextBlock | MathBlock | CodeBlock

export type ThemePreference = 'system' | 'light' | 'dark'

export type StudyFilter = 'all' | 'unseen' | 'needs_review'
export type StudyOrder = 'sequential' | 'shuffled'

export interface Deck {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  deckId: string
  position: number
  front: Block[]
  back: Block[]
  state: CardState
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  normalizedName: string
}

export interface DeckTag {
  deckId: string
  tagId: string
}

export interface StudySession {
  id: string
  deckId: string
  filter: StudyFilter
  order: StudyOrder
  cardIds: string[]
  currentIndex: number
  startedAt: string
  updatedAt: string
}

export interface Settings {
  id: 'app'
  theme: ThemePreference
  lastBackupAt: string | null
  hasLocalChangesSinceBackup: boolean
  storagePersistAsked: boolean
}

export interface DeckProgress {
  unseen: number
  seen: number
  understood: number
  needs_review: number
  total: number
  consulted: number
}
