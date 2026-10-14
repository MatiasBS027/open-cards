import { describe, expect, it } from 'vitest'
import {
  buildSessionCardIds,
  countByFilter,
  pruneSessionCardIds,
} from './session'
import type { Card } from './types'

function card(
  id: string,
  state: Card['state'],
  position: number,
): Card {
  return {
    id,
    deckId: 'd1',
    position,
    front: [{ type: 'text', content: id }],
    back: [{ type: 'text', content: id }],
    state,
    createdAt: '',
    updatedAt: '',
  }
}

describe('SES study sessions', () => {
  const cards = [
    card('a', 'unseen', 0),
    card('b', 'needs_review', 1),
    card('c', 'understood', 2),
  ]

  it('SES-01 filter unseen', () => {
    expect(buildSessionCardIds(cards, 'unseen', 'sequential')).toEqual(['a'])
  })

  it('SES-02 filter needs_review', () => {
    expect(buildSessionCardIds(cards, 'needs_review', 'sequential')).toEqual([
      'b',
    ])
  })

  it('SES-03 shuffle does not change deck order source', () => {
    const ids = buildSessionCardIds(cards, 'all', 'shuffled', () => 0)
    expect(ids).toHaveLength(3)
    expect(new Set(ids)).toEqual(new Set(['a', 'b', 'c']))
  })

  it('SES-05 prune missing cards', () => {
    const pruned = pruneSessionCardIds(
      ['a', 'gone', 'c'],
      new Set(['a', 'c']),
      1,
    )
    // Current card was removed; clamp to the same slot (now 'c').
    expect(pruned).toEqual({ cardIds: ['a', 'c'], currentIndex: 1 })
  })

  it('SES-09 empty filter counts', () => {
    expect(countByFilter([])).toEqual({
      all: 0,
      unseen: 0,
      needs_review: 0,
    })
  })
})
