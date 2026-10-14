import type { Block, CardState } from '../domain/types'

export interface ExportCard {
  id?: string
  front: Block[]
  back: Block[]
  state?: CardState
  createdAt?: string
  updatedAt?: string
}

export interface ExportDeck {
  id?: string
  name: string
  description?: string
  tags?: string[]
  cards: ExportCard[]
  createdAt?: string
  updatedAt?: string
}

export interface ExportLibrary {
  format: 'open-cards'
  version: 1
  exportedAt?: string
  decks: ExportDeck[]
}

export interface ImportDeckDraft {
  name: string
  description: string
  tags: string[]
  cards: Array<{
    front: Block[]
    back: Block[]
    state: CardState
  }>
  warnings: string[]
  errors: string[]
}
