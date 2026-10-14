import type { Card } from './types'

export function sortByPosition(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => a.position - b.position)
}

export function normalizePositions(cards: Card[]): Card[] {
  return sortByPosition(cards).map((card, index) => ({
    ...card,
    position: index,
  }))
}

export function reorderCards(
  cards: Card[],
  activeId: string,
  overId: string,
): Card[] {
  const sorted = sortByPosition(cards)
  const from = sorted.findIndex((c) => c.id === activeId)
  const to = sorted.findIndex((c) => c.id === overId)
  if (from < 0 || to < 0 || from === to) return sorted
  const next = [...sorted]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return normalizePositions(next)
}

export function nextPosition(cards: Card[]): number {
  if (cards.length === 0) return 0
  return Math.max(...cards.map((c) => c.position)) + 1
}
