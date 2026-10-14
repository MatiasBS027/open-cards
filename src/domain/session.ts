import type { Card, CardState, StudyFilter, StudyOrder } from './types'

export function filterCardsByState(
  cards: Card[],
  filter: StudyFilter,
): Card[] {
  if (filter === 'all') return cards
  if (filter === 'unseen') return cards.filter((c) => c.state === 'unseen')
  return cards.filter((c) => c.state === 'needs_review')
}

export function countByFilter(cards: Card[]): Record<StudyFilter, number> {
  return {
    all: cards.length,
    unseen: cards.filter((c) => c.state === 'unseen').length,
    needs_review: cards.filter((c) => c.state === 'needs_review').length,
  }
}

export function buildSessionCardIds(
  cards: Card[],
  filter: StudyFilter,
  order: StudyOrder,
  random: () => number = Math.random,
): string[] {
  const filtered = filterCardsByState(cards, filter).sort(
    (a, b) => a.position - b.position,
  )
  const ids = filtered.map((c) => c.id)
  if (order === 'shuffled') {
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
  }
  return ids
}

export function pruneSessionCardIds(
  cardIds: string[],
  existingIds: ReadonlySet<string>,
  currentIndex: number,
): { cardIds: string[]; currentIndex: number } | null {
  const nextIds = cardIds.filter((id) => existingIds.has(id))
  if (nextIds.length === 0) return null
  const currentId = cardIds[currentIndex]
  let nextIndex = nextIds.indexOf(currentId)
  if (nextIndex < 0) {
    nextIndex = Math.min(currentIndex, nextIds.length - 1)
  }
  return { cardIds: nextIds, currentIndex: nextIndex }
}

export function stateLabel(state: CardState): string {
  switch (state) {
    case 'unseen':
      return 'No vista'
    case 'seen':
      return 'Vista'
    case 'understood':
      return 'Comprendida'
    case 'needs_review':
      return 'Para repasar'
  }
}
