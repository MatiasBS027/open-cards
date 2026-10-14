import { describe, expect, it } from 'vitest'
import { deckHasAllTags, deckMatchesQuery } from './search'
import type { Deck } from './types'

const deck = (name: string): Deck => ({
  id: 'd1',
  name,
  createdAt: '',
  updatedAt: '',
})

describe('SRC-01 deck search', () => {
  it('matches by name substring', () => {
    expect(deckMatchesQuery(deck('Varianza y FGM'), 'fgm')).toBe(true)
    expect(deckMatchesQuery(deck('Series'), 'varianza')).toBe(false)
  })

  it('empty query matches all', () => {
    expect(deckMatchesQuery(deck('X'), '')).toBe(true)
  })
})

describe('SRC-03 tag filter AND', () => {
  it('requires every selected tag', () => {
    expect(deckHasAllTags(['V.A.D.', 'Probabilidad'], ['Probabilidad', 'V.A.D.'])).toBe(
      true,
    )
    expect(deckHasAllTags(['Probabilidad'], ['Probabilidad', 'Examen'])).toBe(false)
  })

  it('no required tags matches all', () => {
    expect(deckHasAllTags(['A'], [])).toBe(true)
  })
})
