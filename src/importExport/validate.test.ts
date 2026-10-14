import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseImportJson, toImportDraft } from './validate'

describe('IMP import validation', () => {
  it('IMP-01 parses example library', () => {
    const text = readFileSync(
      resolve(process.cwd(), 'examples/ejemplo-biblioteca.json'),
      'utf8',
    )
    const parsed = parseImportJson(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.decks).toHaveLength(2)
    const draft = toImportDraft(parsed.data.decks[0])
    expect(draft.errors).toEqual([])
    expect(draft.cards[0].state).toBe('understood')
  })

  it('parses probabilidad-biblioteca example with several decks', () => {
    const text = readFileSync(
      resolve(process.cwd(), 'examples/probabilidad-biblioteca.json'),
      'utf8',
    )
    const parsed = parseImportJson(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.decks.length).toBeGreaterThanOrEqual(3)
    for (const deck of parsed.data.decks) {
      const draft = toImportDraft(deck)
      expect(draft.errors).toEqual([])
      expect(draft.tags.length).toBeGreaterThan(0)
      expect(draft.cards.length).toBeGreaterThan(0)
    }
  })

  it('IMP-10 rejects malformed json', () => {
    const parsed = parseImportJson('{')
    expect(parsed.ok).toBe(false)
  })

  it('defaults missing state to unseen', () => {
    const text = JSON.stringify({
      format: 'open-cards',
      version: 1,
      decks: [
        {
          name: 'T',
          cards: [
            {
              front: [{ type: 'text', content: 'q' }],
              back: [{ type: 'text', content: 'a' }],
            },
          ],
        },
      ],
    })
    const parsed = parseImportJson(text)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(toImportDraft(parsed.data.decks[0]).cards[0].state).toBe('unseen')
  })
})
