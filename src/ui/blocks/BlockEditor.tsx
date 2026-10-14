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
    <section className="side-editor">
      <h3 className="side-editor-title">{label}</h3>
      <div className="side-editor-panel">
        <div className="side-editor-tools">
          <button type="button" className="button-quiet" onClick={() => add('text')}>
            + Texto
          </button>
          <button type="button" className="button-quiet" onClick={() => add('math')}>
            + Matemática
          </button>
          <button type="button" className="button-quiet" onClick={() => add('code')}>
            + Código
          </button>
        </div>

        {blocks.length === 0 ? (
          <p className="muted">Añade al menos un bloque con contenido.</p>
        ) : null}

        <div className="side-editor-blocks">
          {blocks.map((block, index) => (
            <div key={index} className="block-edit-item">
              <div className="block-edit-item-head">
                <strong>{block.type}</strong>
                <button
                  type="button"
                  className="button-quiet danger"
                  onClick={() => remove(index)}
                >
                  Quitar
                </button>
              </div>
              {block.type === 'text' ? (
                <div className="block-edit-body">
                  <textarea
                    value={block.content}
                    rows={3}
                    onChange={(e) =>
                      update(index, { type: 'text', content: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="button-quiet"
                    onClick={() => insertInlineMath(index)}
                  >
                    Insertar fórmula
                  </button>
                </div>
              ) : null}
              {block.type === 'math' ? (
                <div className="block-edit-body">
                  <MathFieldEditor
                    value={block.content}
                    onChange={(content) =>
                      update(index, { type: 'math', content })
                    }
                    label="Editor visual"
                  />
                  <label className="field">
                    <span>LaTeX</span>
                    <input
                      value={block.content}
                      onChange={(e) =>
                        update(index, {
                          type: 'math',
                          content: e.target.value,
                        })
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
                </div>
              ) : null}
              {block.type === 'code' ? (
                <div className="block-edit-body">
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
                    height="120px"
                    extensions={languageExtension(block.language)}
                    onChange={(content) =>
                      update(index, {
                        type: 'code',
                        language: block.language,
                        content,
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
