import { describe, expect, it } from 'vitest'
import { compareSemver, isNewerSemver } from './semver'

describe('semver', () => {
  it('orders versions', () => {
    expect(compareSemver('0.1.5', '0.1.4')).toBe(1)
    expect(compareSemver('v0.1.4', '0.1.4')).toBe(0)
    expect(compareSemver('0.1.3', '0.1.4')).toBe(-1)
  })

  it('detects updates', () => {
    expect(isNewerSemver('0.1.5', '0.1.4')).toBe(true)
    expect(isNewerSemver('0.1.4', '0.1.4')).toBe(false)
  })
})
