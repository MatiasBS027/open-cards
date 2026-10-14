import { createId, nowIso } from '../domain/ids'
import { nextPosition, normalizePositions, reorderCards } from '../domain/order'
import {
  buildSessionCardIds,
  pruneSessionCardIds,
} from '../domain/session'
import {
  classify,
  initialCardState,
  onFlip,
  stateAfterContentEdit,
} from '../domain/state'
import { normalizeTagName } from '../domain/tags'
import type {
  Block,
  Card,
  Deck,
  StudyFilter,
  StudyOrder,
  StudySession,
  ThemePreference,
} from '../domain/types'
import { db, ensureSettings, markLocalChange } from './db'

export async function listDecks(): Promise<Deck[]> {
  return db.decks.orderBy('updatedAt').reverse().toArray()
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id)
}

export async function createDeck(
  name: string,
  description = '',
): Promise<Deck> {
  const now = nowIso()
  const deck: Deck = {
    id: createId(),
    name: name.trim(),
    description: description.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
  await db.transaction('rw', db.decks, db.settings, async () => {
    await db.decks.add(deck)
    await markLocalChange()
  })
  return deck
}

export async function updateDeck(
  id: string,
  patch: { name?: string; description?: string },
): Promise<void> {
  await db.transaction('rw', db.decks, db.settings, async () => {
    await db.decks.update(id, {
      ...patch,
      updatedAt: nowIso(),
    })
    await markLocalChange()
  })
}

export async function deleteDeck(id: string): Promise<{
  deck: Deck
  cards: Card[]
  tags: string[]
} | null> {
  const deck = await db.decks.get(id)
  if (!deck) return null
  const cards = await db.cards.where('deckId').equals(id).toArray()
  const tags = await getDeckTags(id)
  await db.transaction(
    'rw',
    db.decks,
    db.cards,
    db.deckTags,
    db.studySessions,
    db.settings,
    async () => {
      await db.cards.where('deckId').equals(id).delete()
      await db.deckTags.where('deckId').equals(id).delete()
      await db.studySessions.where('deckId').equals(id).delete()
      await db.decks.delete(id)
      await markLocalChange()
    },
  )
  return { deck, cards, tags }
}

export async function restoreDeck(
  deck: Deck,
  cards: Card[],
  tags: string[] = [],
): Promise<void> {
  await db.transaction(
    'rw',
    db.decks,
    db.cards,
    db.tags,
    db.deckTags,
    db.settings,
    async () => {
      await db.decks.put(deck)
      await db.cards.bulkPut(cards)
      await markLocalChange()
    },
  )
  if (tags.length) {
    await setDeckTags(deck.id, tags)
  }
}

export async function listCards(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).sortBy('position')
}

export async function getCard(id: string): Promise<Card | undefined> {
  return db.cards.get(id)
}

export async function createCard(
  deckId: string,
  front: Block[],
  back: Block[],
): Promise<Card> {
  const existing = await listCards(deckId)
  const now = nowIso()
  const card: Card = {
    id: createId(),
    deckId,
    position: nextPosition(existing),
    front,
    back,
    state: initialCardState(),
    createdAt: now,
    updatedAt: now,
  }
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.add(card)
    await db.decks.update(deckId, { updatedAt: now })
    await markLocalChange()
  })
  return card
}

export async function updateCard(
  id: string,
  front: Block[],
  back: Block[],
): Promise<Card | undefined> {
  const existing = await db.cards.get(id)
  if (!existing) return undefined
  const state = stateAfterContentEdit(
    existing.front,
    existing.back,
    front,
    back,
    existing.state,
  )
  const now = nowIso()
  const next: Card = {
    ...existing,
    front,
    back,
    state,
    updatedAt: now,
  }
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.put(next)
    await db.decks.update(existing.deckId, { updatedAt: now })
    await markLocalChange()
  })
  return next
}

export async function setCardState(
  id: string,
  next: 'understood' | 'needs_review' | 'flip',
): Promise<Card | undefined> {
  const existing = await db.cards.get(id)
  if (!existing) return undefined
  const state =
    next === 'flip'
      ? onFlip(existing.state)
      : classify(existing.state, next)
  const now = nowIso()
  const card = { ...existing, state, updatedAt: now }
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.put(card)
    await db.decks.update(existing.deckId, { updatedAt: now })
    await markLocalChange()
  })
  return card
}

export async function deleteCard(id: string): Promise<Card | null> {
  const card = await db.cards.get(id)
  if (!card) return null
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.delete(id)
    const remaining = await db.cards.where('deckId').equals(card.deckId).toArray()
    await db.cards.bulkPut(normalizePositions(remaining))
    await db.decks.update(card.deckId, { updatedAt: nowIso() })
    await markLocalChange()
  })
  return card
}

export async function restoreCard(card: Card): Promise<void> {
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    const siblings = await db.cards.where('deckId').equals(card.deckId).toArray()
    siblings.push(card)
    await db.cards.bulkPut(normalizePositions(siblings))
    await db.decks.update(card.deckId, { updatedAt: nowIso() })
    await markLocalChange()
  })
}

export async function reorderDeckCards(
  deckId: string,
  activeId: string,
  overId: string,
): Promise<Card[]> {
  const cards = await listCards(deckId)
  const next = reorderCards(cards, activeId, overId)
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.bulkPut(next)
    await db.decks.update(deckId, { updatedAt: nowIso() })
    await markLocalChange()
  })
  return next
}

export async function duplicateCard(id: string): Promise<Card | undefined> {
  const source = await db.cards.get(id)
  if (!source) return undefined
  return createCard(source.deckId, source.front, source.back)
}

/** DUP-01: new deck + card IDs; all copies start as unseen. */
export async function duplicateDeck(deckId: string): Promise<Deck | undefined> {
  const source = await getDeck(deckId)
  if (!source) return undefined
  const tags = await getDeckTags(deckId)
  const cards = await listCards(deckId)
  const deck = await createDeck(
    `${source.name} (copia)`,
    source.description ?? '',
  )
  if (tags.length) await setDeckTags(deck.id, tags)
  for (const card of cards) {
    await createCard(deck.id, card.front, card.back)
  }
  return deck
}

export async function moveCard(
  cardId: string,
  targetDeckId: string,
): Promise<void> {
  const card = await db.cards.get(cardId)
  if (!card || card.deckId === targetDeckId) return
  const targetCards = await listCards(targetDeckId)
  const now = nowIso()
  await db.transaction('rw', db.cards, db.decks, db.settings, async () => {
    await db.cards.put({
      ...card,
      deckId: targetDeckId,
      position: nextPosition(targetCards),
      updatedAt: now,
    })
    const origin = await db.cards.where('deckId').equals(card.deckId).toArray()
    await db.cards.bulkPut(normalizePositions(origin))
    await db.decks.update(card.deckId, { updatedAt: now })
    await db.decks.update(targetDeckId, { updatedAt: now })
    await markLocalChange()
  })
}

export async function getDeckTags(deckId: string): Promise<string[]> {
  const links = await db.deckTags.where('deckId').equals(deckId).toArray()
  const tags = await Promise.all(links.map((l) => db.tags.get(l.tagId)))
  return tags.filter(Boolean).map((t) => t!.name)
}

export async function setDeckTags(
  deckId: string,
  tagNames: string[],
): Promise<void> {
  await db.transaction('rw', db.tags, db.deckTags, db.decks, db.settings, async () => {
    await db.deckTags.where('deckId').equals(deckId).delete()
    for (const name of tagNames) {
      const trimmed = name.trim()
      if (!trimmed) continue
      const normalizedName = normalizeTagName(trimmed)
      let tag = await db.tags.where('normalizedName').equals(normalizedName).first()
      if (!tag) {
        tag = { id: createId(), name: trimmed, normalizedName }
        await db.tags.add(tag)
      }
      await db.deckTags.put({ deckId, tagId: tag.id })
    }
    await db.decks.update(deckId, { updatedAt: nowIso() })
    await markLocalChange()
  })
}

export async function getSessionForDeck(
  deckId: string,
): Promise<StudySession | undefined> {
  return db.studySessions.where('deckId').equals(deckId).first()
}

export async function startSession(
  deckId: string,
  filter: StudyFilter,
  order: StudyOrder,
): Promise<StudySession | null> {
  const cards = await listCards(deckId)
  const cardIds = buildSessionCardIds(cards, filter, order)
  if (cardIds.length === 0) return null
  const now = nowIso()
  const session: StudySession = {
    id: createId(),
    deckId,
    filter,
    order,
    cardIds,
    currentIndex: 0,
    startedAt: now,
    updatedAt: now,
  }
  await db.transaction('rw', db.studySessions, async () => {
    const existing = await db.studySessions.where('deckId').equals(deckId).toArray()
    await Promise.all(existing.map((s) => db.studySessions.delete(s.id)))
    await db.studySessions.add(session)
  })
  return session
}

export async function updateSessionIndex(
  sessionId: string,
  currentIndex: number,
): Promise<void> {
  await db.studySessions.update(sessionId, {
    currentIndex,
    updatedAt: nowIso(),
  })
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.studySessions.delete(sessionId)
}

export async function resumeSession(
  deckId: string,
): Promise<StudySession | null> {
  const session = await getSessionForDeck(deckId)
  if (!session) return null
  const cards = await listCards(deckId)
  const pruned = pruneSessionCardIds(
    session.cardIds,
    new Set(cards.map((c) => c.id)),
    session.currentIndex,
  )
  if (!pruned) {
    await deleteSession(session.id)
    return null
  }
  const next = {
    ...session,
    cardIds: pruned.cardIds,
    currentIndex: pruned.currentIndex,
    updatedAt: nowIso(),
  }
  await db.studySessions.put(next)
  return next
}

export async function setTheme(theme: ThemePreference): Promise<void> {
  await ensureSettings()
  await db.settings.update('app', { theme })
}

export async function searchCards(query: string): Promise<
  Array<{ card: Card; deckName: string }>
> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const [cards, decks] = await Promise.all([db.cards.toArray(), db.decks.toArray()])
  const deckMap = new Map(decks.map((d) => [d.id, d.name]))
  return cards
    .filter((card) => {
      const hay = JSON.stringify({ front: card.front, back: card.back }).toLowerCase()
      return hay.includes(q)
    })
    .map((card) => ({
      card,
      deckName: deckMap.get(card.deckId) ?? 'Mazo',
    }))
}
