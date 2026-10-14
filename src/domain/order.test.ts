import { describe, expect, it } from 'vitest'
import type { Card } from './types'
import {
  assignPositions,
  nextPosition,
  normalizePositions,
  reorderCards,
  sortByPosition,
} from './order'

function card(id: string, position: number): Card {
  return {
    id,
    deckId: 'deck-1',
    position,
    front: [{ type: 'text', content: id }],
    back: [{ type: 'text', content: id }],
    state: 'unseen',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('card order helpers', () => {
  it('sortByPosition orders by position ascending', () => {
    const cards = [card('b', 2), card('a', 0), card('c', 1)]
    expect(sortByPosition(cards).map((c) => c.id)).toEqual(['a', 'c', 'b'])
  })

  it('normalizePositions reindexes to 0..n-1', () => {
    const cards = [card('a', 10), card('b', 40), card('c', 20)]
    expect(normalizePositions(cards).map((c) => [c.id, c.position])).toEqual([
      ['a', 0],
      ['c', 1],
      ['b', 2],
    ])
  })

  it('reorderCards moves active onto over and assigns contiguous positions', () => {
    const cards = [card('a', 0), card('b', 1), card('c', 2), card('d', 3)]
    const next = reorderCards(cards, 'd', 'b')
    expect(next.map((c) => c.id)).toEqual(['a', 'd', 'b', 'c'])
    expect(next.map((c) => c.position)).toEqual([0, 1, 2, 3])

    const forward = reorderCards(cards, 'a', 'c')
    expect(forward.map((c) => c.id)).toEqual(['b', 'c', 'a', 'd'])
    expect(forward.map((c) => c.position)).toEqual([0, 1, 2, 3])
  })

  it('reorderCards is a no-op for unknown or identical ids', () => {
    const cards = [card('a', 0), card('b', 1)]
    expect(reorderCards(cards, 'a', 'a').map((c) => c.id)).toEqual(['a', 'b'])
    expect(reorderCards(cards, 'x', 'b').map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('assignPositions keeps array order (does not re-sort)', () => {
    const cards = [card('d', 3), card('a', 0), card('b', 1)]
    expect(assignPositions(cards).map((c) => [c.id, c.position])).toEqual([
      ['d', 0],
      ['a', 1],
      ['b', 2],
    ])
  })

  it('nextPosition returns max+1', () => {
    expect(nextPosition([])).toBe(0)
    expect(nextPosition([card('a', 0), card('b', 4)])).toBe(5)
  })
})
