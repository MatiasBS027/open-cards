import { parseInlineMath } from '../../domain/inlineMath'
import { Katex } from './Katex'

type Props = {
  content: string
  showWarnings?: boolean
}

export function InlineText({ content, showWarnings = false }: Props) {
  const segments = parseInlineMath(content)
  return (
    <span className="inline-text">
      {segments.map((seg, i) => {
        if (seg.kind === 'text') {
          return <span key={i}>{seg.value}</span>
        }
        if (seg.kind === 'math') {
          return <Katex key={i} latex={seg.value} />
        }
        return (
          <span key={i} className={showWarnings ? 'math-warning' : undefined}>
            {seg.value}
            {showWarnings ? <small> ({seg.message})</small> : null}
          </span>
        )
      })}
    </span>
  )
}
