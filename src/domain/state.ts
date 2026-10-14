import type { Block, CardState, DeckProgress } from './types'
import { canonicalizeBlocks } from './blocks'

export function initialCardState(): CardState {
  return 'unseen'
}

export function onFlip(state: CardState): CardState {
  if (state === 'unseen') return 'seen'
  return state
}

export function classify(
  _state: CardState,
  next: 'understood' | 'needs_review',
): CardState {
  return next
}

export function stateAfterContentEdit(
  previousFront: Block[],
  previousBack: Block[],
  nextFront: Block[],
  nextBack: Block[],
  current: CardState,
): CardState {
  const frontChanged =
    canonicalizeBlocks(previousFront) !== canonicalizeBlocks(nextFront)
  const backChanged =
    canonicalizeBlocks(previousBack) !== canonicalizeBlocks(nextBack)
  if (frontChanged || backChanged) return 'unseen'
  return current
}

export function normalizeImportedState(state: unknown): CardState {
  if (
    state === 'unseen' ||
    state === 'seen' ||
    state === 'understood' ||
    state === 'needs_review'
  ) {
    return state
  }
  return 'unseen'
}

export function computeProgress(
  states: readonly CardState[],
): DeckProgress {
  const progress: DeckProgress = {
    unseen: 0,
    seen: 0,
    understood: 0,
    needs_review: 0,
    total: states.length,
    consulted: 0,
  }
  for (const state of states) {
    progress[state] += 1
  }
  progress.consulted = progress.total - progress.unseen
  return progress
}
