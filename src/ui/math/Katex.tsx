import { tryRenderLatex } from '../../math/katexValidate'

type Props = {
  latex: string
  display?: boolean
}

export function Katex({ latex, display = false }: Props) {
  const result = tryRenderLatex(latex, display)
  if (!result.ok) {
    return (
      <span className="math-error" role="alert">
        {latex}
        <small>{result.error}</small>
      </span>
    )
  }
  return (
    <span
      className={display ? 'katex-block' : 'katex-inline'}
      // KaTeX with trust:false is the only allowed HTML injection (SPEC §17).
      dangerouslySetInnerHTML={{ __html: result.html }}
    />
  )
}
