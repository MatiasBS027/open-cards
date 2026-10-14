export type InlineSegment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string }
  | { kind: 'warning'; value: string; message: string }

/**
 * Split plain text into text / inline math segments.
 * - `$...$` → math
 * - `\$` → literal `$`
 * - unclosed `$` → literal with warning
 */
export function parseInlineMath(input: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  let i = 0
  let buffer = ''

  const flushText = () => {
    if (buffer.length > 0) {
      segments.push({ kind: 'text', value: buffer })
      buffer = ''
    }
  }

  while (i < input.length) {
    const ch = input[i]
    if (ch === '\\' && input[i + 1] === '$') {
      buffer += '$'
      i += 2
      continue
    }
    if (ch === '$') {
      const close = input.indexOf('$', i + 1)
      if (close === -1) {
        flushText()
        segments.push({
          kind: 'warning',
          value: input.slice(i),
          message: 'Símbolo $ sin cerrar',
        })
        return segments
      }
      flushText()
      segments.push({ kind: 'math', value: input.slice(i + 1, close) })
      i = close + 1
      continue
    }
    buffer += ch
    i += 1
  }
  flushText()
  return segments
}
