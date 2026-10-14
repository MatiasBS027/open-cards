import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isCardContentValid } from '../../domain/blocks'
import type { Block, CardState } from '../../domain/types'
import { commitImportDraft } from '../../importExport/commitImport'
import type { ImportDeckDraft } from '../../importExport/types'
import {
  checkImportSize,
  draftIsConfirmable,
  parseImportJson,
  toImportDraft,
} from '../../importExport/validate'
import { listDecks } from '../../storage/repositories'
import { BlockEditor } from '../blocks/BlockEditor'
import { BlockRenderer } from '../blocks/BlockRenderer'

function revalidate(draft: ImportDeckDraft): ImportDeckDraft {
  const base = toImportDraft({
    name: draft.name,
    description: draft.description,
    tags: draft.tags,
    cards: draft.cards,
  })
  return {
    ...draft,
    errors: base.errors,
    warnings: base.warnings,
  }
}

export function ImportPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [pending, setPending] = useState<ImportDeckDraft[]>([])
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [current, setCurrent] = useState<ImportDeckDraft | null>(null)
  const [nameWarning, setNameWarning] = useState('')
  const [multiMode, setMultiMode] = useState(false)
  const [previewCard, setPreviewCard] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const openDraft = async (draft: ImportDeckDraft, index: number | null) => {
    const decks = await listDecks()
    setNameWarning(
      decks.some((d) => d.name === draft.name)
        ? `Ya existe un mazo llamado «${draft.name}». Se importará como mazo nuevo.`
        : '',
    )
    setPendingIndex(index)
    setCurrent(revalidate(draft))
    setPreviewCard(0)
    setShowPreview(false)
  }

  const loadText = async (text: string, byteLength: number) => {
    setError('')
    const sizeError = checkImportSize(byteLength)
    if (sizeError) {
      setError(sizeError)
      return
    }
    const parsed = parseImportJson(text)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    const drafts = parsed.data.decks.map(toImportDraft)
    if (drafts.length === 1) {
      setMultiMode(false)
      setPending([])
      await openDraft(drafts[0], null)
      return
    }
    setMultiMode(true)
    setPending(drafts)
    setCurrent(null)
  }

  const updateCard = (
    index: number,
    side: 'front' | 'back',
    blocks: Block[],
  ) => {
    if (!current) return
    const cards = current.cards.map((c, i) =>
      i === index ? { ...c, [side]: blocks } : c,
    )
    setCurrent(revalidate({ ...current, cards }))
  }

  const confirm = async () => {
    if (!current || !draftIsConfirmable(current)) return
    const deck = await commitImportDraft(current)
    if (multiMode && pendingIndex != null) {
      const nextPending = pending.filter((_, i) => i !== pendingIndex)
      setPending(nextPending)
      setCurrent(null)
      setPendingIndex(null)
      if (nextPending.length === 0) {
        navigate(`/decks/${deck.id}`)
      }
      return
    }
    navigate(`/decks/${deck.id}`)
  }

  return (
    <div className="page">
      {!current && pending.length === 0 ? (
        <>
          <header className="page-header">
            <div className="page-header-main">
              <Link to="/">← Mazos</Link>
              <h1>Importar</h1>
            </div>
          </header>
          <section className="panel import-source stack">
            <p className="muted">
              Pega JSON o elige un archivo. Cada mazo se revisa y confirma por
              separado. Siempre se añaden mazos nuevos.
            </p>
            <label className="field">
              <span>JSON</span>
              <textarea
                rows={10}
                placeholder='{ "format": "open-cards", ... }'
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    void loadText(
                      e.target.value,
                      new TextEncoder().encode(e.target.value).length,
                    )
                  }
                }}
              />
            </label>
            <div className="file-picker">
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="file-picker-input"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setFileName(file.name)
                  void file.text().then((text) => loadText(text, file.size))
                }}
              />
              <button
                type="button"
                className="button"
                onClick={() => fileRef.current?.click()}
              >
                Seleccionar archivo
              </button>
              <span className="muted">
                {fileName || 'Sin archivos seleccionados'}
              </span>
            </div>
            {error ? <p className="math-error">{error}</p> : null}
          </section>
        </>
      ) : null}

      {!current && pending.length > 0 ? (
        <>
          <header className="page-header">
            <div className="page-header-main">
              <Link to="/">← Mazos</Link>
              <h1>Importar</h1>
            </div>
          </header>
          <section className="panel stack">
            <h2>Mazos pendientes ({pending.length})</h2>
            <p className="muted">Confirma cada mazo por separado.</p>
            {pending.map((draft, i) => (
              <div key={`${draft.name}-${i}`} className="row between">
                <div>
                  <strong>{draft.name}</strong>
                  <p className="muted">
                    {draft.cards.length} tarjetas
                    {draft.errors.length
                      ? ` · ${draft.errors.length} error(es)`
                      : ''}
                  </p>
                </div>
                <button type="button" onClick={() => void openDraft(draft, i)}>
                  Revisar
                </button>
              </div>
            ))}
            <button
              type="button"
              className="ghost"
              onClick={() => navigate('/')}
            >
              Terminar más tarde
            </button>
          </section>
        </>
      ) : null}

      {current ? (
        <div className="import-draft">
          <header className="page-header">
            <div className="page-header-main">
              <Link to="/">← Mazos</Link>
              <h1>Importar mazo</h1>
              <p className="muted">
                Todo lo que ves es editable antes de guardar.
              </p>
            </div>
            <div className="page-header-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? 'Editar' : 'Vista previa'}
              </button>
            </div>
          </header>

          {nameWarning ? <p className="warn">{nameWarning}</p> : null}
          {current.errors.map((err) => (
            <p key={err} className="math-error">
              {err}
            </p>
          ))}

          <section className="panel import-meta stack">
            <label className="field">
              <span>Nombre del mazo</span>
              <input
                value={current.name}
                onChange={(e) =>
                  setCurrent(revalidate({ ...current, name: e.target.value }))
                }
              />
            </label>
            <div className="import-meta-row">
              <label className="field">
                <span>Descripción</span>
                <input
                  value={current.description}
                  onChange={(e) =>
                    setCurrent(
                      revalidate({
                        ...current,
                        description: e.target.value,
                      }),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Etiquetas</span>
                <input
                  value={current.tags.join(', ')}
                  placeholder="Cálculo, Examen 1"
                  onChange={(e) =>
                    setCurrent(
                      revalidate({
                        ...current,
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      }),
                    )
                  }
                />
              </label>
            </div>
          </section>

          {showPreview && current.cards[previewCard] ? (
            <section className="panel stack">
              <div className="row between">
                <h2>Vista previa</h2>
                <p className="muted">
                  {previewCard + 1} de {current.cards.length}
                </p>
              </div>
              <div className="study-flash preview-only">
                <span className="study-face-label">ANVERSO</span>
                <div className="study-flash-content">
                  <BlockRenderer blocks={current.cards[previewCard].front} />
                </div>
              </div>
              <div className="study-flash preview-only">
                <span className="study-face-label">REVERSO</span>
                <div className="study-flash-content">
                  <BlockRenderer blocks={current.cards[previewCard].back} />
                </div>
              </div>
              <div className="row gap">
                <button
                  type="button"
                  className="ghost"
                  disabled={previewCard === 0}
                  onClick={() => setPreviewCard((i) => Math.max(0, i - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="ghost"
                  disabled={previewCard >= current.cards.length - 1}
                  onClick={() =>
                    setPreviewCard((i) =>
                      Math.min(current.cards.length - 1, i + 1),
                    )
                  }
                >
                  Siguiente
                </button>
              </div>
            </section>
          ) : (
            current.cards.map((card, index) => (
              <section key={index} className="panel import-card stack">
                <div className="row between">
                  <h2>Tarjeta {index + 1}</h2>
                  <p className="muted">
                    {index + 1} de {current.cards.length} · Borrador
                  </p>
                </div>
                <label className="field">
                  <span>Estado</span>
                  <select
                    value={card.state}
                    onChange={(e) => {
                      const state = e.target.value as CardState
                      const cards = current.cards.map((c, i) =>
                        i === index ? { ...c, state } : c,
                      )
                      setCurrent(revalidate({ ...current, cards }))
                    }}
                  >
                    <option value="unseen">No vista</option>
                    <option value="seen">Vista</option>
                    <option value="understood">Comprendida</option>
                    <option value="needs_review">Para repasar</option>
                  </select>
                </label>
                {!isCardContentValid(card.front, card.back) ? (
                  <p className="math-error">Contenido incompleto</p>
                ) : null}
                <BlockEditor
                  label="Anverso"
                  blocks={card.front}
                  onChange={(blocks) => updateCard(index, 'front', blocks)}
                />
                <BlockEditor
                  label="Reverso"
                  blocks={card.back}
                  onChange={(blocks) => updateCard(index, 'back', blocks)}
                />
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    const cards = current.cards.filter((_, i) => i !== index)
                    setCurrent(revalidate({ ...current, cards }))
                  }}
                >
                  Quitar tarjeta
                </button>
              </section>
            ))
          )}

          <div className="import-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setCurrent(null)
                setPendingIndex(null)
                if (!multiMode) setPending([])
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="button primary"
              disabled={!draftIsConfirmable(current)}
              onClick={() => void confirm()}
            >
              Confirmar este mazo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
