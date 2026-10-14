import { describe, expect, it } from 'vitest'
import { isCardContentValid, sideHasContent } from './blocks'

describe('card content validation', () => {
  it('rejects empty string blocks', () => {
    expect(
      isCardContentValid(
        [{ type: 'text', content: '   ' }],
        [{ type: 'text', content: 'ok' }],
      ),
    ).toBe(false)
  })

  it('accepts non-empty front and back', () => {
    expect(
      isCardContentValid(
        [{ type: 'text', content: 'Q' }],
        [{ type: 'math', content: 'x^2' }],
      ),
    ).toBe(true)
  })

  it('sideHasContent requires trim', () => {
    expect(sideHasContent([{ type: 'code', language: 'sql', content: ' ' }])).toBe(
      false,
    )
  })
})
