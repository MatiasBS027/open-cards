import { describe, expect, it } from 'vitest'
import { isLatexRenderable } from './katexValidate'

describe('MTH-01 katex render', () => {
  it('renders common calculus formulas', () => {
    expect(isLatexRenderable('\\frac{d}{dx}\\sin x = \\cos x')).toBe(true)
    expect(
      isLatexRenderable(
        '\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{f\'(x)}{g\'(x)}',
      ),
    ).toBe(true)
    expect(isLatexRenderable('x^2')).toBe(true)
  })

  it('rejects empty and broken latex', () => {
    expect(isLatexRenderable('')).toBe(false)
    expect(isLatexRenderable('\\frac{1}{')).toBe(false)
  })
})
