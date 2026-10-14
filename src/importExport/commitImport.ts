import { createId, nowIso } from '../domain/ids'
import type { Card, Deck } from '../domain/types'
import { db, markLocalChange } from '../storage/db'
import { setDeckTags } from '../storage/repositories'
import { draftIsConfirmable } from './validate'
import type { ImportDeckDraft } from './types'

export async function commitImportDraft(draft: ImportDeckDraft): Promise<Deck> {
  if (!draftIsConfirmable(draft)) {
    throw new Error('El borrador tiene errores; no se puede confirmar.')
  }
  const now = nowIso()
  const deck: Deck = {
    id: createId(),
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  const cards: Card[] = draft.cards.map((card, index) => ({
    id: createId(),
    deckId: deck.id,
    position: index,
    front: card.front,
    back: card.back,
    state: card.state,
    createdAt: now,
    updatedAt: now,
  }))

  await db.transaction('rw', db.decks, db.cards, db.settings, async () => {
    await db.decks.add(deck)
    if (cards.length) await db.cards.bulkAdd(cards)
    await markLocalChange()
  })
  if (draft.tags.length) {
    await setDeckTags(deck.id, draft.tags)
  }
  return deck
}
