import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { php } from '@codemirror/lang-php'
import { python } from '@codemirror/lang-python'
import { sql } from '@codemirror/lang-sql'
import { CODE_LANGUAGES } from '../../config'
import type { Block } from '../../domain/types'
import { isLatexRenderable } from '../../math/katexValidate'
import { MathFieldEditor } from '../math/MathFieldEditor'
import { Katex } from '../math/Katex'

type Props = {
  label: string
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

function languageExtension(language: string) {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return [javascript({ typescript: language === 'typescript' })]
    case 'python':
      return [python()]
    case 'java':
      return [java()]
    case 'php':
      return [php()]
    case 'sql':
    case 'postgresql':
      return [sql()]
    default:
      return []
  }
}

export function BlockEditor({ label, blocks, onChange }: Props) {
  const update = (index: number, block: Block) => {
    const next = [...blocks]
    next[index] = block
    onChange(next)
  }

  const remove = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const add = (type: Block['type']) => {
    if (type === 'code') {
      onChange([...blocks, { type: 'code', language: 'plaintext', content: '' }])
    } else {
      onChange([...blocks, { type, content: '' }])
    }
  }

  const insertInlineMath = (index: number) => {
    const block = blocks[index]
    if (block.type !== 'text') return
    const latex = window.prompt('LaTeX de la fórmula en línea', 'x^2')
    if (latex == null) return
    update(index, {
      ...block,
      content: `${block.content}$${latex}$`,
    })
  }

  return (
    <section className="block-editor">
      <header className="block-editor-header">
        <h3>{label}</h3>
        <div className="row gap">
          <button type="button" onClick={() => add('text')}>
            + Texto
          </button>
          <button type="button" onClick={() => add('math')}>
            + Matemática
          </button>
          <button type="button" onClick={() => add('code')}>
            + Código
          </button>
        </div>
      </header>
      {blocks.length === 0 ? (
        <p className="muted">Añade al menos un bloque con contenido.</p>
      ) : null}
      {blocks.map((block, index) => (
        <div key={index} className="block-edit-item">
          <div className="row between">
            <strong>{block.type}</strong>
            <button type="button" className="danger" onClick={() => remove(index)}>
              Quitar
            </button>
          </div>
          {block.type === 'text' ? (
            <>
              <textarea
                value={block.content}
                rows={4}
                onChange={(e) =>
                  update(index, { type: 'text', content: e.target.value })
                }
              />
              <button type="button" onClick={() => insertInlineMath(index)}>
                Insertar fórmula
              </button>
            </>
          ) : null}
          {block.type === 'math' ? (
            <>
              <MathFieldEditor
                value={block.content}
                onChange={(content) => update(index, { type: 'math', content })}
                label="Editor visual"
              />
              <label className="field">
                <span>LaTeX</span>
                <input
                  value={block.content}
                  onChange={(e) =>
                    update(index, { type: 'math', content: e.target.value })
                  }
                />
              </label>
              {block.content.trim() ? (
                isLatexRenderable(block.content) ? (
                  <Katex latex={block.content} display />
                ) : (
                  <p className="math-error">Fórmula no renderizable</p>
                )
              ) : null}
            </>
          ) : null}
          {block.type === 'code' ? (
            <>
              <label className="field">
                <span>Lenguaje</span>
                <select
                  value={block.language}
                  onChange={(e) =>
                    update(index, {
                      type: 'code',
                      language: e.target.value,
                      content: block.content,
                    })
                  }
                >
                  {CODE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </label>
              <CodeMirror
                value={block.content}
                height="140px"
                extensions={languageExtension(block.language)}
                onChange={(content) =>
                  update(index, {
                    type: 'code',
                    language: block.language,
                    content,
                  })
                }
              />
            </>
          ) : null}
        </div>
      ))}
    </section>
  )
}
