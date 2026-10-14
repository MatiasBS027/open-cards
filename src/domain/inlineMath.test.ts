import { describe, expect, it } from 'vitest'
import { parseInlineMath } from './inlineMath'

describe('TXT inline math', () => {
  it('TXT-01 parses formula inside sentence', () => {
    expect(parseInlineMath('derivada de $x^2$ es')).toEqual([
      { kind: 'text', value: 'derivada de ' },
      { kind: 'math', value: 'x^2' },
      { kind: 'text', value: ' es' },
    ])
  })

  it('TXT-02 escaped dollar and unclosed', () => {
    expect(parseInlineMath('cuesta \\$5')).toEqual([
      { kind: 'text', value: 'cuesta $5' },
    ])
    const unclosed = parseInlineMath('mal $x')
    expect(unclosed).toEqual([
      { kind: 'text', value: 'mal ' },
      {
        kind: 'warning',
        value: '$x',
        message: 'Símbolo $ sin cerrar',
      },
    ])
  })
})
