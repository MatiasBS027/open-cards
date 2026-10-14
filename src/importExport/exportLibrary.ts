import type { Card, Deck } from '../domain/types'
import { db, markBackupDone } from '../storage/db'
import { getDeckTags, listCards, listDecks } from '../storage/repositories'
import type { ExportLibrary } from './types'

async function serializeDeck(
  deck: Deck,
  cards: Card[],
): Promise<ExportLibrary['decks'][number]> {
  const tags = await getDeckTags(deck.id)
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    tags,
    cards: cards
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        state: card.state,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })),
    createdAt: deck.createdAt,
    updatedAt: deck.updatedAt,
  }
}

export async function exportDeck(deckId: string): Promise<ExportLibrary> {
  const deck = await db.decks.get(deckId)
  if (!deck) throw new Error('Mazo no encontrado')
  const cards = await listCards(deckId)
  const library: ExportLibrary = {
    format: 'open-cards',
    version: 1,
    exportedAt: new Date().toISOString(),
    decks: [await serializeDeck(deck, cards)],
  }
  await markBackupDone()
  return library
}

export async function exportAll(): Promise<ExportLibrary> {
  const decks = await listDecks()
  if (decks.length === 0) {
    throw new Error('No hay mazos para exportar.')
  }
  const serialized = await Promise.all(
    decks.map(async (deck) => serializeDeck(deck, await listCards(deck.id))),
  )
  const library: ExportLibrary = {
    format: 'open-cards',
    version: 1,
    exportedAt: new Date().toISOString(),
    decks: serialized,
  }
  await markBackupDone()
  return library
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
