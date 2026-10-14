import { describe, expect, it } from 'vitest'
import {
  classify,
  computeProgress,
  initialCardState,
  normalizeImportedState,
  onFlip,
  stateAfterContentEdit,
} from './state'

describe('EST card states', () => {
  it('EST-01 new card starts unseen', () => {
    expect(initialCardState()).toBe('unseen')
  })

  it('EST-02 flip unseen to seen', () => {
    expect(onFlip('unseen')).toBe('seen')
    expect(onFlip('seen')).toBe('seen')
    expect(onFlip('understood')).toBe('understood')
  })

  it('EST-03 classify without flip', () => {
    expect(classify('unseen', 'understood')).toBe('understood')
    expect(classify('unseen', 'needs_review')).toBe('needs_review')
  })

  it('EST-04 change classification', () => {
    expect(classify('understood', 'needs_review')).toBe('needs_review')
  })

  it('EST-05 content edit resets to unseen', () => {
    const front = [{ type: 'text' as const, content: 'a' }]
    const back = [{ type: 'text' as const, content: 'b' }]
    const nextFront = [{ type: 'text' as const, content: 'a!' }]
    expect(
      stateAfterContentEdit(front, back, nextFront, back, 'understood'),
    ).toBe('unseen')
  })

  it('EST-06 flip keeps classification', () => {
    expect(onFlip('needs_review')).toBe('needs_review')
  })

  it('EST-07 save without content change keeps state', () => {
    const front = [{ type: 'text' as const, content: 'a' }]
    const back = [{ type: 'text' as const, content: 'b' }]
    expect(
      stateAfterContentEdit(front, back, front, back, 'understood'),
    ).toBe('understood')
  })

  it('missing state becomes unseen', () => {
    expect(normalizeImportedState(undefined)).toBe('unseen')
    expect(normalizeImportedState('understood')).toBe('understood')
  })

  it('progress counts each card once', () => {
    const p = computeProgress(['unseen', 'seen', 'understood', 'needs_review'])
    expect(p).toEqual({
      unseen: 1,
      seen: 1,
      understood: 1,
      needs_review: 1,
      total: 4,
      consulted: 3,
    })
  })
})
