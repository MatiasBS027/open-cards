import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isLatexRenderable } from '../../math/katexValidate'
import { InlineText } from '../math/InlineText'
import { Katex } from '../math/Katex'
import { MathFieldEditor } from '../math/MathFieldEditor'

const SAMPLES = [
  'x^2',
  '\\frac{d}{dx}\\sin x = \\cos x',
  '\\lim_{x\\to a}\\frac{f(x)}{g(x)}',
  '\\int_0^1 x^2 \\, dx',
]

/** Prototipo MathLive + KaTeX + inline $...$ (MTH-01). */
export function MathLabPage() {
  const [latex, setLatex] = useState('\\frac{a}{b}')
  const [text, setText] = useState('La derivada de $\\sin x$ es $\\cos x$.')

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-main">
          <Link to="/">← Mazos</Link>
          <h1>Laboratorio de matemáticas</h1>
        </div>
      </header>
      <p className="muted" style={{ marginBottom: '1.25rem' }}>
        Comprueba MathLive → LaTeX → KaTeX y texto con fórmulas en línea.
      </p>

      <div className="math-lab">
        <section className="math-lab-section">
          <h2>Fórmula destacada</h2>
          <MathFieldEditor value={latex} onChange={setLatex} label="MathLive" />
          <label className="field">
            <span>LaTeX</span>
            <input value={latex} onChange={(e) => setLatex(e.target.value)} />
          </label>
          <div className="preview-panel">
            {isLatexRenderable(latex) ? (
              <Katex latex={latex} display />
            ) : (
              <p className="math-error">
                KaTeX no pudo renderizar esta fórmula.
              </p>
            )}
          </div>
          <div className="sample-row">
            {SAMPLES.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setLatex(sample)}
              >
                {sample}
              </button>
            ))}
          </div>
        </section>

        <section className="math-lab-section">
          <h2>Texto con $...$</h2>
          <label className="field">
            <span>Entrada</span>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <div className="preview-panel align-start">
            <InlineText content={text} showWarnings />
          </div>
        </section>
      </div>
    </div>
  )
}
