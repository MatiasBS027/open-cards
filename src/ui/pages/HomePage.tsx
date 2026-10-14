import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UNDO_MS } from '../../config'
import { computeProgress } from '../../domain/state'
import type { Deck, ThemePreference } from '../../domain/types'
import { downloadJson, exportAll } from '../../importExport/exportLibrary'
import {
  createDeck,
  deleteDeck,
  getDeckTags,
  listCards,
  listDecks,
  restoreDeck,
  setDeckTags,
} from '../../storage/repositories'
import { BrandMark } from '../brand/BrandMark'
import { UndoToast } from '../components/UndoToast'
import { FadeContent } from '../motion/FadeContent'
import { useTheme } from '../theme'

function parseTagsInput(value: string): string[] {
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function HomePage() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<Deck[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [deckTags, setDeckTagsMap] = useState<Record<string, string[]>>({})
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [undo, setUndo] = useState<{
    deck: Deck
    cards: Awaited<ReturnType<typeof listCards>>
    tags: string[]
  } | null>(null)
  const { theme, setTheme } = useTheme()

  const reload = async () => {
    const list = await listDecks()
    setDecks(list)
    const map: Record<string, string> = {}
    const tagMap: Record<string, string[]> = {}
    for (const deck of list) {
      const cards = await listCards(deck.id)
      const p = computeProgress(cards.map((c) => c.state))
      map[deck.id] =
        `${p.total} tarjetas · ${p.understood} comprendidas · ${p.needs_review} repasar`
      tagMap[deck.id] = await getDeckTags(deck.id)
    }
    setProgress(map)
    setDeckTagsMap(tagMap)
  }

  useEffect(() => {
    void reload()
  }, [])

  useEffect(() => {
    if (!undo) return
    const t = window.setTimeout(() => setUndo(null), UNDO_MS)
    return () => window.clearTimeout(t)
  }, [undo])

  const resetCreateForm = () => {
    setName('')
    setDescription('')
    setTagsInput('')
    setCreating(false)
  }

  const onCreate = async () => {
    if (!name.trim()) return
    const deck = await createDeck(name, description)
    const tags = parseTagsInput(tagsInput)
    if (tags.length) {
      await setDeckTags(deck.id, tags)
    }
    resetCreateForm()
    await reload()
    navigate(`/decks/${deck.id}`)
  }

  const onDelete = async (deck: Deck) => {
    const cards = await listCards(deck.id)
    if (
      !window.confirm(`¿Eliminar «${deck.name}» y ${cards.length} tarjeta(s)?`)
    ) {
      return
    }
    const snapshot = await deleteDeck(deck.id)
    if (snapshot) setUndo(snapshot)
    await reload()
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-header-main">
          <h1 className="brand-heading">
            <BrandMark to={null} animated />
          </h1>
        </div>
        <div className="page-header-actions">
          <select
            className="toolbar-select"
            aria-label="Tema"
            value={theme}
            onChange={(e) => void setTheme(e.target.value as ThemePreference)}
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
          <Link className="button" to="/import">
            Importar
          </Link>
          <button
            type="button"
            onClick={() =>
              void exportAll()
                .then((data) =>
                  downloadJson('open-cards-biblioteca.json', data),
                )
                .catch((err: Error) => alert(err.message))
            }
          >
            Exportar todo
          </button>
          <Link className="button ghost" to="/math-lab">
            Math lab
          </Link>
        </div>
      </header>

      {creating ? (
        <section className="panel stack">
          <h2>Nuevo mazo</h2>
          <label className="field">
            <span>Nombre del mazo</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del mazo"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void onCreate()
              }}
            />
          </label>
          <label className="field">
            <span>Descripción</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </label>
          <label className="field">
            <span>Etiquetas</span>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Probabilidad, Examen"
            />
            <span className="muted field-hint">
              Separa varias etiquetas con comas.
            </span>
          </label>
          <div className="row gap wrap">
            <button type="button" onClick={() => void onCreate()}>
              Crear mazo
            </button>
            <button type="button" className="ghost" onClick={resetCreateForm}>
              Cancelar
            </button>
          </div>
        </section>
      ) : null}

      <section className="deck-list section-gap">
        {!creating ? (
          <button
            type="button"
            className="deck-create-card"
            onClick={() => setCreating(true)}
          >
            <span className="deck-create-plus" aria-hidden>
              +
            </span>
            <span className="deck-create-label">Nuevo mazo</span>
          </button>
        ) : null}

        {decks.length === 0 && !creating ? (
          <p className="muted">
            No hay mazos. Crea uno para empezar a estudiar.
          </p>
        ) : null}

        {decks.map((deck, index) => (
          <FadeContent key={deck.id} delay={Math.min(index, 8) * 0.04} y={8}>
            <article className="deck-card">
              <div className="row between">
                <div>
                  <h2>
                    <Link to={`/decks/${deck.id}`}>{deck.name}</Link>
                  </h2>
                  {deck.description ? (
                    <p className="muted">{deck.description}</p>
                  ) : null}
                  {(deckTags[deck.id] ?? []).length > 0 ? (
                    <div className="tag-row">
                      {deckTags[deck.id]!.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="muted">{progress[deck.id]}</p>
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => void onDelete(deck)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          </FadeContent>
        ))}
      </section>

      {undo ? (
        <UndoToast
          message={`Mazo «${undo.deck.name}» eliminado`}
          onUndo={() => {
            void restoreDeck(undo.deck, undo.cards, undo.tags).then(() => {
              setUndo(null)
              void reload()
            })
          }}
          onDismiss={() => setUndo(null)}
        />
      ) : null}
    </div>
  )
}
