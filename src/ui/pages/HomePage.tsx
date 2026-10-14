import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UNDO_MS } from '../../config'
import { shouldShowBackupReminder } from '../../domain/backup'
import { deckHasAllTags, deckMatchesQuery } from '../../domain/search'
import { computeProgress } from '../../domain/state'
import { normalizeTagName } from '../../domain/tags'
import type { Deck, ThemePreference } from '../../domain/types'
import { downloadJson, exportAll } from '../../importExport/exportLibrary'
import { ensureSettings } from '../../storage/db'
import {
  createDeck,
  deleteDeck,
  duplicateDeck,
  getDeckTags,
  listCards,
  listDecks,
  restoreDeck,
  searchCards,
  setDeckTags,
} from '../../storage/repositories'
import { BrandMark } from '../brand/BrandMark'
import { BackupReminder } from '../components/BackupReminder'
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
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [cardHits, setCardHits] = useState<
    Awaited<ReturnType<typeof searchCards>>
  >([])
  const [showBackup, setShowBackup] = useState(false)
  const [backupDismissed, setBackupDismissed] = useState(false)
  const [undo, setUndo] = useState<{
    deck: Deck
    cards: Awaited<ReturnType<typeof listCards>>
    tags: string[]
  } | null>(null)
  const { theme, setTheme } = useTheme()

  const allTags = useMemo(() => {
    const set = new Map<string, string>()
    for (const tags of Object.values(deckTags)) {
      for (const tag of tags) {
        set.set(normalizeTagName(tag), tag)
      }
    }
    return [...set.values()].sort((a, b) => a.localeCompare(b, 'es'))
  }, [deckTags])

  const filteredDecks = useMemo(() => {
    return decks.filter(
      (deck) =>
        deckMatchesQuery(deck, query) &&
        deckHasAllTags(deckTags[deck.id] ?? [], selectedTags),
    )
  }, [decks, deckTags, query, selectedTags])

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

  const refreshBackup = async () => {
    const settings = await ensureSettings()
    setShowBackup(shouldShowBackupReminder(settings))
  }

  useEffect(() => {
    void reload()
    void refreshBackup()
  }, [])

  useEffect(() => {
    if (!undo) return
    const t = window.setTimeout(() => setUndo(null), UNDO_MS)
    return () => window.clearTimeout(t)
  }, [undo])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setCardHits([])
      return
    }
    const handle = window.setTimeout(() => {
      void searchCards(q).then(setCardHits)
    }, 200)
    return () => window.clearTimeout(handle)
  }, [query])

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
    await refreshBackup()
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
    await refreshBackup()
  }

  const onDuplicate = async (deck: Deck) => {
    const copy = await duplicateDeck(deck.id)
    await reload()
    await refreshBackup()
    if (copy) navigate(`/decks/${copy.id}`)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const key = normalizeTagName(tag)
      const has = prev.some((t) => normalizeTagName(t) === key)
      if (has) return prev.filter((t) => normalizeTagName(t) !== key)
      return [...prev, tag]
    })
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
                .then((data) => {
                  downloadJson('open-cards-biblioteca.json', data)
                  setBackupDismissed(false)
                  void refreshBackup()
                })
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

      {showBackup && !backupDismissed ? (
        <BackupReminder
          onDismiss={() => setBackupDismissed(true)}
          onExported={() => {
            setBackupDismissed(false)
            void refreshBackup()
          }}
        />
      ) : null}

      <section className="library-toolbar" aria-label="Buscar y filtrar">
        <label className="field">
          <span>Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mazos o texto de tarjetas…"
            aria-label="Buscar mazos y tarjetas"
          />
        </label>
        {allTags.length > 0 ? (
          <div className="tag-filter-row" role="group" aria-label="Filtrar por etiquetas">
            {allTags.map((tag) => {
              const active = selectedTags.some(
                (t) => normalizeTagName(t) === normalizeTagName(tag),
              )
              return (
                <button
                  key={tag}
                  type="button"
                  className={`tag-filter-chip${active ? ' is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        ) : null}
      </section>

      {cardHits.length > 0 ? (
        <section className="card-search-results" aria-label="Tarjetas encontradas">
          <h2 className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Tarjetas ({cardHits.length})
          </h2>
          {cardHits.slice(0, 20).map(({ card, deckName }) => (
            <Link
              key={card.id}
              className="card-search-hit"
              to={`/decks/${card.deckId}/cards/${card.id}`}
            >
              <strong>{deckName}</strong>
              <span className="muted"> · abrir tarjeta</span>
            </Link>
          ))}
        </section>
      ) : null}

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

        {decks.length > 0 && filteredDecks.length === 0 ? (
          <p className="muted">Ningún mazo coincide con la búsqueda o etiquetas.</p>
        ) : null}

        {filteredDecks.map((deck, index) => (
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
                <div className="deck-card-actions">
                  <button
                    type="button"
                    className="button-quiet"
                    onClick={() => void onDuplicate(deck)}
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void onDelete(deck)}
                  >
                    Eliminar
                  </button>
                </div>
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
