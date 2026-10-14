import { normalizeTagName } from './tags'
import type { Deck } from './types'

/** SRC-01: match deck name (case-insensitive substring). */
export function deckMatchesQuery(deck: Deck, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return deck.name.toLowerCase().includes(q)
}

/** SRC-03: deck must have every selected tag (AND). */
export function deckHasAllTags(
  deckTagNames: string[],
  requiredTags: string[],
): boolean {
  if (requiredTags.length === 0) return true
  const have = new Set(deckTagNames.map(normalizeTagName))
  return requiredTags.every((t) => have.has(normalizeTagName(t)))
}
